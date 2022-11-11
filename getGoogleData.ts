import { promises as fs } from 'fs';
import moment from 'moment';
var glob = require("glob")
import { getFile } from './s3';
import * as fs from 'fs';

type DateNick = {
    month: string;
    year: string;
}

import { addUser, getUser, getUserFromGoogleId, getUsers, addLocations, addTrips } from "./useDB";

export async function getGoogleData(date: DateNick){

    const { month, year } = date;

    const filePath = `../../data/Location History/Semantic Location History/${year}/${year}_${month.toUpperCase()}.json`;

    const data = await fs.readFile(filePath, 'utf8')

    return JSON.parse(data)

}

export async function getGoogleDataFromFile(filePath: string){

    const data = await fs.readFile(filePath, 'utf8')

    return JSON.parse(data)

}

export async function getGoogleDataFromBucket(filePath: string){

    const json = await getFile(filePath)

    // const json = (file) => file.Body.json();

    // console.log("returned file", json);

    return json

}


export async function convertAllGoogleData(files:string[], googleId: string){

    const profile = await getUserFromGoogleId(googleId);

       const installLocations = async(files:string[]) => {

            for (let file of files) {

                const data = await getGoogleDataFromBucket(file);

                console.log("processing file", file, "userId", profile.id);

                try{

                let trips = await convertGoogleData(data);

                const dbData = await createDatabaseData(profile.id, trips);

                const dbLocations = await addLocations(dbData.locations);

                const dbTrips = await addTrips(dbData.trips);

                }catch(e){
                    console.log('weird that it breaks here', e)
                }

            }

            return true;

          }

    // glob( '../../data/Location History/Semantic Location History/**/*.json', async ( err:any, files:string[] ) => {

        await installLocations(files);
    

    // });
    
    return true;

}



export async function convertGoogleData(data: any){

    if(data === undefined){
        console.log('no data', data)
        return;
    }else{
        // console.log('data', data)
    }

    const trips = data?.timelineObjects;

    if(trips === undefined){
        console.log('no trips', data, trips)
        return;
    }

    // console.log('data 2', data)

    let allTrips: any = [];
try{ 
    trips
    // .filter(trip => { return trip.activitySegment?.activityType == "IN_PASSENGER_VEHICLE"} )
    .map((trip: any, index: number) => {

        // console.log('trip', trip)
        // Create the object:

        try{

            if(trip.activitySegment?.activityType == "IN_PASSENGER_VEHICLE"){

                let thisTrip = {

                // So a trip is created by splicing the place visit and activity segment together

                // The place visit is the start of the trip

                    start: trips[index-1].placeVisit,
                    activity: trip.activitySegment,
                    end: trips[index + 1].placeVisit,

                }

                // console.log('pushing a trip', thisTrip)

                allTrips.push(thisTrip);

            }

        }catch(e){
            // console.log('trip error', e)
        }

    })
}catch(e){
    console.log('error', e)
}
 
// console.log('allTrips', allTrips)

return allTrips;


}

type Location = {

    name: string;
    latitude: number;
    longitude: number;
    address: string;
    placeId: string;

}

type Trip = {

    distance:        number;
    startTime:       Date;
    endTime:       Date;
    month: number,
    year: number,
    endLocation:     string;
    startLocation:   string;
    user:         string;

}

export async function createDatabaseData(userId:string, data:any){

    const getLocation = (trip:any) => {

        let location:Location = {
            name: trip.name ?? ( trip.address || "No Name"),
            latitude: trip.latitudeE7,
            longitude: trip.longitudeE7,
            address: trip.address ?? 'No address',
            placeId: trip.placeId ?? 'No placeId',
        }

        return location;

    }

    const getTrip = (data:any) => {

        let trip:Trip = {
            distance:  data.activity.distance ?? 0,
            startTime:  data.activity.duration.startTimestamp ?? null,
            endTime:  data.activity.duration.endTimestamp ?? null,
            month: Number(moment(data.activity.duration.startTimestamp).month()) ?? null,
            year: Number(moment(data.activity.duration.startTimestamp).year()) ?? null,
            endLocation:  data.end.location.placeId ?? 'No end location',
            startLocation:  data.start.location.placeId ?? 'No start location',
            user:  userId,
        }

        return trip;

    }

    const locations = new Map<string, Location>();
    const trips = new Map<string, Trip>();
        
    for(var a in data){

        // console.log(data[a].start.location.placeId)

        try{
            locations.set(data[a].start.location.placeId, getLocation(data[a].start.location))
        }catch(e){
            // console.log('createLocations error', e)
        }

        try{
            trips.set(data[a].start.location.placeId, getTrip(data[a]))
        }catch(e){
            // console.log('createLocations error', e)
        }

        try{
            locations.set(data[a].end.location.placeId, getLocation(data[a].end.location))
        }catch(e){
            // console.log('createLocations error', e)
        }


    }

    return {trips: trips, locations: locations};

}
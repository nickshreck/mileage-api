import { promises as fsx } from "fs";
import moment from "moment";
var glob = require("glob");
import { getFile } from "./s3";
import { listFiles } from "./s3";
import { getUserFromGoogleId, addLocations, addTrips } from "./useDB";

export async function getGoogleDataFromFile(filePath: string) {
    const data = await fsx.readFile(filePath, "utf8");

    return JSON.parse(data);
}

export async function convertAllGoogleData(
    files: string[],
    googleId: string,
    source: string
) {
    const profile = await getUserFromGoogleId(googleId);

    const installLocations = async (files: string[]) => {
        for (let file of files) {
            let data;
            if (source == "local") {
                data = await getGoogleDataFromFile(file);
            } else {
                data = await getFile(file);
            }

            try {
                let trips = await convertGoogleData(data);

                if (!profile) {
                    return;
                }

                console.log(
                    "processing file",
                    trips,
                    file,
                    "userId",
                    profile?.id
                );

                const dbData = await createDatabaseData(profile.id, trips);

                const dbLocations = await addLocations(dbData.locations);

                const dbTrips = await addTrips(dbData.trips);
            } catch (e) {
                console.log("converting a file to data error", e);
            }
        }

        return true;
    };

    await installLocations(files);

    return true;
}

// This is the heart of the data conversion:

export async function convertGoogleData(data: any) {
    if (data === undefined) {
        console.log("no data", data);
        return;
    } else {
        // console.log('data', data)
    }

    const trips = data?.timelineObjects;

    if (trips === undefined) {
        // console.log('no trips', data, trips)
        return;
    }

    // console.log("data 2", data);

    let allTrips: any = [];
    try {
        trips
            // .filter(trip => { return trip.activitySegment?.activityType == "IN_PASSENGER_VEHICLE"} )
            .map((trip: any, index: number) => {
                // console.log('trip', trip)
                // Create the object:

                try {
                    if (
                        trip.activitySegment?.activityType ==
                        "IN_PASSENGER_VEHICLE"
                    ) {
                        let thisTrip = {
                            // So a trip is created by splicing the place visit and activity segment together

                            // The place visit is the start of the trip

                            start: trips[index - 1].placeVisit,
                            activity: trip.activitySegment,
                            end: trips[index + 1].placeVisit,
                        };

                        console.log("pushing a trip", thisTrip);

                        allTrips.push(thisTrip);
                    }
                } catch (e) {
                    // console.log('trip error', e)
                }
            });
    } catch (e) {
        console.log("error", e);
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
};

type Trip = {
    distance: number;
    startTime: Date;
    endTime: Date;
    month: number;
    year: number;
    endLocation: string;
    startLocation: string;
    user: string;
};

export async function createDatabaseData(userId: string, data: any) {
    const getLocation = (trip: any) => {
        let location: Location = {
            name: trip.name ?? (trip.address || "No Name"),
            latitude: trip.latitudeE7,
            longitude: trip.longitudeE7,
            address: trip.address ?? "No address",
            placeId: trip.placeId ?? "No placeId",
        };

        return location;
    };

    const getTrip = (data: any) => {
        // console.log(
        //     "getTrip",
        //     // data,
        //     data.activity.duration.startTimestamp,
        //     data.activity.distance,
        //     Number(moment(data.activity.duration.startTimestamp).month())
        // );

        let trip: Trip = {
            distance: data.activity.distance ?? 0,
            startTime: data.activity.duration.startTimestamp ?? null,
            endTime: data.activity.duration.endTimestamp ?? null,
            month:
                Number(
                    moment(data.activity.duration.startTimestamp).month() + 1
                ) ?? null,
            year:
                Number(moment(data.activity.duration.startTimestamp).year()) ??
                null,
            endLocation: data.end.location.placeId ?? "No end location",
            startLocation: data.start.location.placeId ?? "No start location",
            user: userId,
        };

        return trip;
    };

    const locations = new Map<string, Location>();
    const trips = new Map<string, Trip>();

    for (var a in data) {
        try {
            locations.set(
                data[a].start.location.placeId,
                getLocation(data[a].start.location)
            );
        } catch (e) {
            console.log("createLocations 1 error", e);
        }

        try {
            console.log("setting a trip", data[a]);
            trips.set(
                data[a].activity.duration.startTimestamp,
                getTrip(data[a])
            );
        } catch (e) {
            console.log("createLocations 2 error", e);
        }

        try {
            locations.set(
                data[a].end.location.placeId,
                getLocation(data[a].end.location)
            );
        } catch (e) {
            console.log("createLocations 3 error", e);
        }
    }

    console.log("trips after DB fiddle", trips);

    return { trips: trips, locations: locations };
}

// Start the data processing:

export const triggerGoogleDataTransfer = async (googleId: string) => {
    // console.log("reached triggerGoogleDataTransfer");
    // This fetches a list of the files from the S3 bucket:
    // const files = await listFiles(googleId);
    // This converts the data from the files into a format that can be used by the database:
    // const data = await convertAllGoogleData(files, googleId, "online");

    // or if loaded from a local file:
    glob(
        "../../data/Location History/Semantic Location History/**/*.json",
        async (err: any, files: string[]) => {
            await convertAllGoogleData(files, googleId, "local");
        }
    );

    return;
};

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function addUser({name: name, userId: userId}: {name: string, userId: string}) {

    const user =  await prisma.user.create({ data: { name: name } })
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    return user

}

export async function getUsers(){

    const users = await prisma.user.findMany()
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    return users

}

export async function getUser(profile:{ name: string, email: string, imageUrl: string, googleId:string}){

    const users = await prisma.user.findUnique({
        where: {
          googleId: profile.googleId,
        },
      })
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

        if(!users){

            const create = await prisma.user.create({ data: { name: profile.name, email: profile.email, googleId: profile.googleId, imageUrl: profile.imageUrl } })
            .catch(e => {
                console.error(e.message)
            })
            .finally(async () => {
                await prisma.$disconnect()
            })

            // console.log("created user", create)

        }else{
            // console.log('already exists', users)
        }

    // console.log('users return', users)

    return users

}

export async function getUserFromGoogleId(googleId:string){

    const user = await prisma.user.findUnique({
        where: {
          googleId: googleId,
        },
      })
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    return user

}

export async function getTrips(input: {userId: string, month: number, year: number}){

    const trips = await prisma.trip.findMany({
        where: {
            user: input.userId,
            month: input.month,
            year: input.year 
        },
        include: { startLocationId: true, endLocationId: true },
    })
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    return trips

}

type Location = {

    name: string;
    latitude: number;
    longitude: number;
    address: string;
    placeId: string;

}

export async function addLocations(data:Map<string, Location>){

    const locationsArr = [...data].map(([name, value]) => (value));

    const locations = await prisma.location.createMany({data: locationsArr, skipDuplicates: true})
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    console.log('locations', locations)

    return locations

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

export async function addTrips(data:Map<string, Trip>){

    // console.log('addTrips data', data)
    
    const tripsArr = [...data].map(([name, value]) => (value));

    const trips = await prisma.trip.createMany({data: tripsArr, skipDuplicates: true})
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    // console.log('trips', trips)

    return trips

}

export async function deleteAll(userId: string){

    const trips = await prisma.trip.deleteMany({where: {user: userId}})
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    const locations = await prisma.location.deleteMany()
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


    const users = await prisma.user.deleteMany()
    .catch(e => {
        console.error(e.message)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

    console.log('deleted all', trips, locations, users)

    return trips

}
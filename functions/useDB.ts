import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { z } from "zod";

export async function addUser({
    name: name,
    userId: userId,
    email: email,
    googleId: googleId,
    imageUrl: imageUrl,
}: {
    name: string;
    userId: string;
    email: string;
    googleId: string;
    imageUrl: string;
}) {
    const user = await prisma.user
        .create({
            data: {
                name: name,
                email: email,
                googleId: googleId,
                imageUrl: imageUrl,
            },
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    return user;
}

export async function getUsers() {
    const users = await prisma.user
        .findMany()
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    return users;
}

export async function getUser(profile: {
    name: string;
    email: string;
    imageUrl: string;
    googleId: string;
}) {
    const users = await prisma.user
        .findUnique({
            where: {
                googleId: profile.googleId,
            },
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    if (!users) {
        const create = await prisma.user
            .create({
                data: {
                    name: profile.name,
                    email: profile.email,
                    googleId: profile.googleId,
                    imageUrl: profile.imageUrl,
                },
            })
            .catch((e) => {
                console.error(e.message);
            })
            .finally(async () => {
                await prisma.$disconnect();
            });

        // console.log("created user", create)
    } else {
        // console.log('already exists', users)
    }

    // console.log('users return', users)

    return users;
}

export async function getUserFromGoogleId(googleId: string) {
    const user = await prisma.user
        .findUnique({
            where: {
                googleId: googleId,
            },
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    return user;
}

export async function getTrips(input: {
    userId: string;
    month: number;
    year: number;
}) {
    const trips = await prisma.trip
        .findMany({
            where: {
                user: input.userId,
                month: input.month,
                year: input.year,
            },
            include: { startLocationId: true, endLocationId: true },
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    return trips;
}

export async function checkData(input: { userId: string }) {
    const trips = await prisma.trip
        .findMany({
            where: {
                user: input.userId,
            },
            select: { month: true, year: true },
            distinct: ["month", "year"],
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    if (!trips) return { years: [], months: [] };

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // if(trips.)

    const years = trips.reduce((acc: any, item) => {
        if (!acc.find((y: any) => y.year === item.year)) {
            acc.push({ year: item.year, months: [] });
        }
        return acc;
    }, []);

    trips.forEach((item) => {
        const year = years.find((y: any) => y.year === item.year);
        const month = { label: monthNames[item.month - 1], value: item.month };
        if (!year.months.find((m: any) => m.value === month.value)) {
            year.months.push(month);
        }
    });

    return { years };
}

function tripsReduce(trips: any) {
    return trips.reduce((acc: any, trip: any) => {
        const key = `${trip.startLocation}-${trip.endLocation}`;
        if (!acc[key]) {
            acc[key] = {
                // trip: key,
                startLocation: trip.startLocationId.name,
                startLocationId: trip.startLocationId.placeId,
                endLocation: trip.endLocationId.name,
                endLocationId: trip.endLocationId.placeId,
                count: 0,
            };
        }
        acc[key].count++;
        if (!acc[key].trips) acc[key].trips = [];
        // acc[key].trips = [];
        acc[key].trips.push(trip);
        return acc;
    }, {});
}

export async function searchTrips(input: {
    userId: string;
    month: number;
    year: number;
    search: string;
}) {
    // console.log("searchTrips", input.search, input.search == "all.unique");

    if (input.search == "all.unique") {
        const data = await prisma.trip
            .findMany({
                where: {
                    user: input.userId,
                    month: input.month,
                    year: input.year,
                },
                include: { startLocationId: true, endLocationId: true },
            })
            .catch((e) => {
                console.error(e.message);
            })
            .finally(async () => {
                await prisma.$disconnect();
            });

        // console.log("searchTrips", data);

        // Find all the unique trips

        const trips = tripsReduce(data);
        return Object.keys(trips).map((key) => trips[key]);
    }
}

export async function getLocations(input: {
    userId: string;
    month: number;
    year: number;
    search: string;
}) {
    const startLocations = await prisma.trip
        .findMany({
            where: {
                user: input.userId,
                month: input.month,
                year: input.year,
            },
            include: { startLocationId: true },
            distinct: ["startLocation"],
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    const endLocations = await prisma.trip
        .findMany({
            where: {
                user: input.userId,
                month: input.month,
                year: input.year,
            },
            include: { endLocationId: true },
            distinct: ["endLocation"],
        })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    if (!startLocations || !endLocations) return [];

    const sL = startLocations.reduce((result: any, entry: any) => {
        result.push({
            label: entry.startLocationId.name,
            value: entry.startLocationId.placeId,
        });
        result.sort((a: any, b: any) => {
            // Compare the name properties of the objects
            if (a.label < b.label) {
                return -1;
            }
            if (a.label > b.label) {
                return 1;
            }
            return 0;
        });
        return result;
    }, []);

    const eL = endLocations.reduce((result: any, entry: any) => {
        result.push({
            label: entry.endLocationId.name,
            value: entry.endLocationId.placeId,
        });
        result.sort((a: any, b: any) => {
            // Compare the name properties of the objects
            if (a.label < b.label) {
                return -1;
            }
            if (a.label > b.label) {
                return 1;
            }
            return 0;
        });
        return result;
    }, []);

    return { sL, eL };
}

type Location = {
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    placeId: string;
};

export async function addLocations(data: Map<string, Location>) {
    const locationsArr = [...data].map(([name, value]) => value);

    const locations = await prisma.location
        .createMany({ data: locationsArr, skipDuplicates: true })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    // console.log("locations", locations);

    return locations;
}

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

export async function addTrips(data: Map<string, Trip>) {
    // console.log("addTrips data", data);

    const tripsArr = [...data].map(([name, value]) => value);

    const trips = await prisma.trip
        .createMany({ data: tripsArr, skipDuplicates: true })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    // console.log("trips", trips);

    return trips;
}

export async function updateTrip(userId: string, classification: any) {
    const data = await prisma.trip.update({
        where: {
            id: userId,
        },
        data: {
            classification: classification,
        },
    });

    // console.log("updateTrips db", userId, classification, data);

    return data;
}

export async function deleteAll(userId: string) {
    const trips = await prisma.trip
        .deleteMany({ where: { user: userId } })
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    const locations = await prisma.location
        .deleteMany()
        .catch((e) => {
            console.error(e.message);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });

    // const users = await prisma.user.deleteMany()
    // .catch(e => {
    //     console.error(e.message)
    // })
    // .finally(async () => {
    //     await prisma.$disconnect()
    // })

    // console.log("deleted all", trips, locations);

    return trips;
}

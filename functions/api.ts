import * as trpc from "@trpc/server";
import {
    addUser,
    getUser,
    deleteAll,
    getTrips,
    updateTrip,
    searchTrips,
    getLocations,
} from "./useDB";
import { z } from "zod";
import { listFiles } from "./s3";
import { triggerGoogleDataTransfer } from "./getGoogleData";

const appRouter = trpc
    .router()
    .query("getTrips", {
        input: z.object({
            userId: z.string(),
            year: z.number(),
            month: z.number(),
        }),
        async resolve({ input }) {
            let data = await getTrips({
                userId: input.userId,
                year: input.year,
                month: input.month,
            });
            return data;
        },
    })
    .query("searchTrips", {
        input: z.object({
            userId: z.string(),
            year: z.number(),
            month: z.number(),
            search: z.string(),
        }),
        async resolve({ input }) {
            let data = await searchTrips({
                userId: input.userId,
                year: input.year,
                month: input.month,
                search: input.search,
            });
            return data;
        },
    })
    .query("getLocations", {
        input: z.object({
            userId: z.string(),
            year: z.number(),
            month: z.number(),
            search: z.string(),
        }),
        async resolve({ input }) {
            let data = await getLocations({
                userId: input.userId,
                year: input.year,
                month: input.month,
                search: input.search,
            });
            return data;
        },
    })
    .query("getUser", {
        input: z.object({
            name: z.string(),
            email: z.string(),
            imageUrl: z.string(),
            googleId: z.string(),
        }),
        async resolve({ input }) {
            let data = await getUser({
                name: input.name,
                email: input.email,
                imageUrl: input.imageUrl,
                googleId: input.googleId,
            });
            return data;
        },
    })
    .mutation("addUser", {
        input: z.object({
            userId: z.string(),
            name: z.string(),
            email: z.string(),
            googleId: z.string(),
        }),
        async resolve({ input }) {
            const data = await addUser({
                name: input.name,
                userId: input.userId,
                email: input.email,
                googleId: input.googleId,
            });
            return true;
        },
    })
    .mutation("updateTrip", {
        input: z.object({
            id: z.string(),
            classification: z.string(),
        }),
        async resolve({ input }) {
            const data = await updateTrip(input.id, input.classification);
            return true;
        },
    })
    // .mutation("createDatabaseData", {
    //     input: z.object({
    //         userId: z.string(),
    //     }),
    //     async resolve({ input }) {
    //         // console.log("using userId", input.userId);

    //         const data = await convertAllGoogleData(input.userId);

    //         // console.log("data", data);

    //         return true;
    //     },
    // })
    .mutation("deleteAll", {
        input: z.object({
            userId: z.string(),
        }),
        async resolve({ input }) {
            const data = await deleteAll(input.userId);
            return {};
        },
    })
    .mutation("dataTransfer", {
        input: z.object({
            googleId: z.string(),
        }),
        async resolve({ input }) {
            // This is the function that will be called when the user clicks the button to transfer their data

            // This will be scanning the existing files, not from the upload

            const files = await triggerGoogleDataTransfer(input.googleId);

            return {
                result: files,
                status: "success",
            };
        },
    });

export type AppRouter = typeof appRouter;
export { appRouter };

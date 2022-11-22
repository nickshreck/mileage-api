import * as trpc from "@trpc/server";
import { addUser, getUser, deleteAll, getTrips } from "./useDB";
import { z } from "zod";
import { listFiles } from "./s3";

const appRouter = trpc
  .router()
  .query("getTrips", {
    input: z.object({
      userId: z.string(),
      year: z.number(),
      month: z.number()
    }),
    async resolve({ input }) {

      console.log('getTrips', input)

      let data = await getTrips(input);

      return (data);

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

      let data = await getUser(input);

      console.log("getUser", input, data)

      return ( data );

    },
  })
  .mutation("addUser", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
    }),
    async resolve({ input }) {

      const data = await addUser(input);

      console.log('data', data);

      return true;
    }
  })
  .mutation("createDatabaseData", {
    input: z.object({
      userId: z.string()
    }),
    async resolve({ input }) {

      console.log('using userId', input.userId);

      const data = await convertAllGoogleData(input.userId);

      console.log('data', data);

      return true;
    }
  })
  .mutation("deleteAll", {
      input: z.object({
        userId: z.string()
      }),
      async resolve({ input }) {
  
        const data = await deleteAll(input.userId);
  
        console.log('data', data);
  
        return {

        };
      },
  })
  .mutation("dataTransfer", {
      input:z.object({
        googleId: z.string()
      }),
    async resolve({input}) {

      // This is the function that will be called when the user clicks the button to transfer their data

      // This will be scanning the existing files, not from the upload

      const files = await listFiles(input.googleId);

      const data = await convertAllGoogleData(files, input.googleId);

      return {

        result: data,
        status: 'success'

      };
    },
})

export type AppRouter = typeof appRouter;
export { appRouter };
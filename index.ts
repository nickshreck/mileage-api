import express from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { z } from "zod";
import { convertAllGoogleData }  from "./getGoogleData";
import { addUser, getUsers, getUser, addLocations, deleteAll, getTrips } from "./useDB";
import bodyParser from 'body-parser';

import dotenv from 'dotenv'
dotenv.config()
import multer from "multer";
import { uploadFile } from "./s3Upload";

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

      // console.log("getUser", input, data)

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

      const files = await listFiles(input);

      const data = await convertAllGoogleData(files, input.googleId);

      return {

        result: data,
        status: 'success'

      };
    },
})

export type AppRouter = typeof appRouter;

const app = express();
app.use(cors());
const port = 2000;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => null,
  })
);

app.listen(port, () => {
  console.log(`api-server listening at http://localhost:${port}`);
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 3 },
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

app.post("/upload", upload.array("file"), async (req, res) => {
  const files = req.files;
  req.props = Object.assign(req.query, req.params, req.body);
  try {
    const results = await uploadFile(files, req.props.googleId);
    console.log(results);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

app.use(express.json());

app.post("/googleDataTransfer", async (req, res) => {

  try {
    console.log("hello you have been contacted from Lambda to tell you to run the googleTransfer", req.body);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});


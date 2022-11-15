import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";

import { appRouter } from "./functions/api";

import dotenv from 'dotenv'
dotenv.config()

import multer from "multer";
import { uploadFile } from "./functions/s3";
import { triggerGoogleDataTransfer } from "./functions/getGoogleData";

const app = express();
app.use(cors());
const port = 80;

// Express:

app.use('/', express.static('../client/dist/'));

// tRPC:

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


// Upload file to S3 && Lambda function

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
    await triggerGoogleDataTransfer(req.body.googleId);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});


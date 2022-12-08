import {
    S3Client,
    ListObjectsCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
var fs = require("fs");
// const Stream = require("stream");

// import dotenv from "dotenv";
// dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const client = new S3Client({ region: process.env.AWS_REGION });

export const listFiles = async (googleId: any) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        // Delimiter: '/',
        Prefix: googleId,
    };

    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: googleId + ".zip",
        });
        const response = await client.send(command);
    } catch (e) {
        console.log("error deleting zip", e);
    }

    const data = await client.send(new ListObjectsCommand(params));

    let files: any;

    if (!data.Contents) {
        return;
    }

    try {
        files = data.Contents.filter(
            (file: any) => "Key" in file && file.Key.endsWith(".json")
        ).map((file) => file.Key);
    } catch (e) {
        console.log("error getting files", e);
    }

    // console.log('data listFiles', files);

    return files;
};

const streamToString = (stream: any) =>
    new Promise((resolve, reject) => {
        const chunks = [] as string[];
        stream.on("data", (chunk: any) => {
            // console.log('chunking', chunk);
            chunks.push(chunk);
        });
        stream.on("error", reject);

        stream.on("end", () =>
            resolve(Buffer.concat(chunks.map(Buffer.from)).toString("utf8"))
        );
    });

export const getFile = async (fileName: any) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        ResponseContentType: "application/json",
    };

    const command = new GetObjectCommand(params);
    const response = await client.send(command);

    const { Body } = response;

    const string: any = await streamToString(Body);

    try {
        return JSON.parse(string);
    } catch (e) {
        console.log("error parsing json", e);
        return;
    }
};

export const uploadFile = async (files: any, googleId: any) => {
    if (
        AWS_REGION == undefined ||
        AWS_ACCESS_KEY_ID == undefined ||
        AWS_SECRET_ACCESS_KEY == undefined
    ) {
        return;
    }
    const s3client = new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
    });

    const params = files.map((file: { originalname: string; buffer: any }) => {
        console.log("file", file);
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${googleId}.zip`,
            Body: file.buffer,
        };
    });

    return await Promise.all(
        params.map((param: any) => s3client.send(new PutObjectCommand(param)))
    );
};

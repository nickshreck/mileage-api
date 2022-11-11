import { S3Client, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
var fs = require('fs');
const Stream = require('stream')

const client = new S3Client({ region: process.env.AWS_REGION, });

export const listFiles = async (googleId) => {

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    // Delimiter: '/',
    Prefix: googleId
  };

  const command = new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: googleId + ".zip" });
  const response = await client.send(command);

  const data = await client.send(new ListObjectsCommand(params));

  const files = data.Contents.map((file) => { if(file.Key.includes('json')) return (file.Key) });

  // console.log('data listFiles', files);

  return files;

}

const streamToString = (stream) => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', (chunk) => { 
    // console.log('chunking', chunk); 
    chunks.push(chunk) } );
  stream.on('error', reject);
  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

export const getFile = async (fileName) => {

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ResponseContentType: 'application/json'
  };

  const command = new GetObjectCommand(params);
  const response = await client.send(command);

  const { Body } = response; 

  const string = await streamToString(Body);

  // console.log('data getFile', JSON.parse(json));

  return JSON.parse(string);

}
import { S3Client, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
var fs = require('fs');
const Stream = require('stream')

const client = new S3Client({ region: process.env.AWS_REGION, });

export const listFiles = async (googleId) => {

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    // Delimiter: '/',
    Prefix: googleId
  };

  try{
  const command = new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: googleId + ".zip" });
  const response = await client.send(command);
  }catch(e){
    console.log("error deleting zip", e);
  }

  const data = await client.send(new ListObjectsCommand(params));

  let files;

  try{
    const filesFilter = data.Contents.filter((file) => file.Key.includes('json'));
    files = filesFilter.map((file) => { if(file.Key.includes('json')) return (file.Key) });
  }catch(e){
    console.log("error getting files", e);
  }
  
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

  try{
  return JSON.parse(string);
  }catch(e){
    console.log("error parsing json", e);
    return;
  }

}

export const uploadFile = async (files, googleId) => {
  const s3client = new S3Client();

  const params = files.map((file:{originalname:string, buffer:any}) => {
    console.log('file', file);
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${googleId}.zip`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param) => s3client.send(new PutObjectCommand(param)))
  );
};
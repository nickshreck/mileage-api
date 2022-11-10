import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
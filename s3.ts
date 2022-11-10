import { S3Client } from "@aws-sdk/client-s3";
const multer = require('multer')
const multerS3 = require('multer-s3')


const s3 = new S3Client({ region: process.env.AWS_REGION, });

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

var express = require('express'),
    aws = require('aws-sdk'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    accessKeyId: 'XXXXXXXXXXXXXXX',
    region: 'us-east-1'
});

var app = express(),
    s3 = new aws.S3();

app.use(bodyParser.json());

var upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'bucket-name',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});

//open in browser to see upload form
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');//index.html is inside node-cheat
});

//use by upload form
app.post('/upload', upload.array('upl', 25), function (req, res, next) {
    res.send({
        message: "Uploaded!",
        urls: req.files.map(function(file) {
            return {url: file.location, name: file.key, type: file.mimetype, size: file.size};
        })
    });
});
  
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


// export const uploadFile = async (file) => {
  
//   const client = new S3Client({ region: process.env.AWS_REGION, });

//   console.log('file', file);

//   const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: file.originalname,
//       Body: file.buffer,
//       UploadId: file.uploadId,
//     };

//   const command = new AbortMultipartUploadCommand(params);

//   try {
//     const data = await client.send(command);
//     // process data.
//   } catch (error) {
//     // error handling.
//   } finally {
//     // finally.
//   }

// };

export const listFiles = async () => {

  const client = new S3Client({ region: process.env.AWS_REGION, });

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  const data = await s3client.send(new ListObjectsCommand(params));

  return data;

}
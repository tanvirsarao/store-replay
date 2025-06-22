const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const uploadToS3 = (params, callback) => {
  s3.upload(params, callback);
};

const getS3Object = async (key) => {
  const params = {
    Bucket: 'storereplay-sessions',
    Key: key,
  };

  const data = await s3.getObject(params).promise();
  return data.Body.toString('utf-8');
};

module.exports = {
  s3,
  uploadToS3,
  getS3Object,
};

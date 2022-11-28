var AWS = require('aws-sdk');
const s3 = new AWS.S3();
var uuid = require('uuid');
const fs = require("fs");
const path = require("path");
let bucketName = process.env.BUCKET_NAME;
var bucketParams = {
  Bucket: bucketName,
  ACL: "public-read"
};

module.exports = {
  uploadS3: (createdTimeSpan, fileBuffer, fileName) => {

    let contentType = {};

    return new Promise((resolve, reject) => {
      let fileType = fileName.split('.').pop();
      let upload_type_allowed = ['.png', '.jpeg', '.jpg', '.bmp'];
      if (fileType == "pdf") {
        contentType = {
          ContentType: 'application/pdf'
        };
      } else if (upload_type_allowed.includes("." + fileType)) {
        contentType = {
          ContentType: 'image/jpeg'
        };
      }

      try {

        let params = {
          ...bucketParams,
          ...contentType,
          Body: fileBuffer,
          Key: `${createdTimeSpan}/${fileName}`
        };

        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            console.log(data)
            console.log("resolved");
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  makeFolder: async (createdTimeSpan) => {
    return new Promise((resolve, reject) => {
      try {
        let readmeText = "Patient Folder Generated";
        let fileData = readmeText.toString("binary");
        let params = {
          ...bucketParams,
          Body: fileData,
          Key: `${createdTimeSpan}/readme.txt`
        };
        let response = s3.upload(params, (err, data) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        });
      } catch (err) {
        return reject(err);
      }
    });
  },
  getFolders: async () => {
    let response = await s3.listObjects(bucketParams);

    //console.log(response);
  },
  getBucket: async () => {
    try {
      let response = await s3.listBuckets();

      //console.log(response.Buckets)
    } catch (err) {
      console.log(err)
    }
  },
  deleteFile: async (createdTimeSpan, fileName) => {
    return new Promise((resolve, reject) => {
      try {
        let params = {
          Bucket: bucketName,
          Key: `${createdTimeSpan}/${fileName}`
        }
        //console.log("here")
        s3.deleteObject(params, (err, data) => {
          if (err) {
            //console.log(err)
            reject(err);
          } else {
            //console.log("here in success",data)
            resolve(true);
          }
        })
      } catch (err) {
        reject(err)
      }
    })

  }
};

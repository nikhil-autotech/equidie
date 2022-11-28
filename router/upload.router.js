const express = require('express');
const multer=require('multer')
let storage = multer.diskStorage({
  // destination: function (req, file, callback) {
  //     console.log("file", file);
  //  callback(null, "./Uploads/");
  // },
  filename: function (req, file, callback) {
      callback(null, file.originalname);
  }
});
let maxSize = 1000000 * 1000;
let upload = multer({
  storage: storage,
  limits: {
      fileSize: maxSize
  }
});
  var single=upload.single('file')

const router = express.Router();
// const upload = require('../config/multer.config.js');

const awsWorker = require('../controller/aws.controller');

// router.post('/api/v1/file/upload', upload.single('file'), awsWorker.doUpload);
router.post('/api/v1/file/upload',single, awsWorker.fileUpload);

// router.delete('/api/v1/file/:link/delete', awsWorker.deleteObject);

module.exports = router;

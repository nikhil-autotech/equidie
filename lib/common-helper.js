const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const handlebars = require('handlebars');
const logger = require("../lib/logger-helper")
const awsHelper = require("../lib/aws-helper");

// let sendEmail = async (...args) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let template_path = path.join(__dirname, "../", "templates/")
//       let html = fs.readFileSync(template_path + args[3], "utf8");
//       var template = handlebars.compile(html);
//       var htmlToSend = template(args[4]);
//       if (!args[5]) {
//         var transporter = nodemailer.createTransport({
//           host: process.env.EMAIL_SERVICE_HOST,
//           port: process.env.EMAIL_SERVICE_PORT,
//           secure: false,
//           auth: {
//             user: process.env.EMAIL_SERVICE_USER,
//             pass: process.env.EMAIL_SERVICE_PASSWORD
//           },
//           source: process.env.MAIL_FROM
//         });
//       } else {
//         var transporter = args[5];
//       }

//       let content = {
//         from: `NcrRugby <${process.env.MAIL_FROM}>`, // sender address
//         to: args[1], // list of receivers
//         subject: args[2],
//       }

//       if (args[6]) {
//         content = {
//           ...content,
//           attachments: args[6],
//           html: htmlToSend
//         }
//       } else {
//         content = {
//           ...content,
//           html: htmlToSend
//         }
//       }
//       // console.log(transporter)
//       // console.log(content)
//       let info = transporter.sendMail({
//         ...content

//       }, (err, result) => {
//         if (err) console.log("error in send email function", err);
//         else console.log(result);
//       });

//     } catch (err) {
//       reject(err)
//     } finally {
//       resolve('success!!!!!!!!!')
//     }
//   })
// };


let upload = async (req, imageType = '') => {
  const fileUpload = require('express-fileupload');
  const path = require('path');
  const fs = require("fs");

  return new Promise((resolve, reject) => {
    try {
      if (req.files.profile_image) {
        let file_to_upload = req.files ? req.files.profile_image : '';
        // let file_to_upload = req.files.image
        //console.log(req.files)

        let absolute_path = path.join(__dirname, "../public/temp");
        if (!fs.existsSync(absolute_path)) {
          fs.mkdirSync(absolute_path, { recursive: true })
          fs.chmodSync(absolute_path, '775', function (err) {
            if (err) throw err;
          });
        }
        var extension = file_to_upload.name.split('.').pop();
        // if (upload_type_allowed.includes("." + extension)) {
        var orignal_name = (new Date()).getTime() + "." + extension;
        //var orignal_name = file_to_upload.name;
        file_to_upload.mv(absolute_path + '/' + orignal_name, async (err) => {
          if (err) {
            reject(err)

          } else {
            //Action as required
            try {
              let imgdir = "profile";
              let a = await saveToS3(req, orignal_name, imgdir);
              // console.log(a)
              // console.log(orignal_name)
              let imageRes = { "imagePath": imgdir + "/" + orignal_name, "imageType": imageType, "name": orignal_name };
              resolve(imageRes)
            } catch (err) {
              console.log(err)
            }

          }
        });
      }
    } catch (err) {
      reject(err)
    }
  })
}

let saveToS3 = async (req, uploaded_payload, bucketdir) => {
  return new Promise(async (resolve, reject) => {
    try {

      let payload_absolute_path = path.join(__dirname, "../", req.constants.temp_base_path, uploaded_payload);
      // console.log(payload_absolute_path)
      if (fs.existsSync(payload_absolute_path)) {
        let fileBuffer = fs.readFileSync(payload_absolute_path);;
        fs.unlinkSync(payload_absolute_path);
        let user_created_timespan = bucketdir;
        await awsHelper.makeFolder(user_created_timespan);
        let uploadResponse = await awsHelper.uploadS3(user_created_timespan, fileBuffer, uploaded_payload);
        resolve(true);
      } else {
        resolve(true);
      }

    } catch (err) {

      reject(err);
      // throw new Error("Image not uploaded" + err);
    }
  })
}



let createAccessToken = async (...args) => {
  let expiresIn = new Date().getTime();
  let deviceModel = args[4].devices;
  let access_token = jwt.sign({ email: args[0], user_id: args[1], fullName: args[3], expiresIn: expiresIn }, process.env.SECRET_KEY, { expiresIn: '365d' });
  try {
    if (args[6]) {
      let saveData = await deviceModel.update({
        accessToken: access_token
      }, {
        where: {
          id: args[5]
        }
      });
      return access_token;
    } else {
      let d = await deviceModel.create({
        accessToken: access_token,
        userId: args[1]
      });
      return access_token;
    }
    //console.log(d)
  } catch (error) {
    console.log(error)
  }
};
let apiKeyGeneration = async (email, user_id, database) => {
  let api_token = crypto.createHash('sha256').update(email).digest('base64');
  let saveData = await userModel.update({
    apiToken: api_token
  }, {
    where: {
      id: user_id
    }
  });
  return api_token;
};
let getCurrentUTCTime = () => {
  let date = new Date();
  let minutes = date.getUTCMinutes();
  minutes = (Math.floor(minutes / 10)) == 0 ? "0" + minutes : minutes;
  return date.getUTCHours() + ":" + minutes;
};
getCurrentUTCDate = () => {
  return new Date().toUTCString();
};


const generateVerificationEmail = async (token) => {
  const crypto = require("crypto");
  let verifyEmailToken = crypto.createHash('sha256').update(token).digest('hex');
  return verifyEmailToken
}

module.exports = {
  sendEmail: (...args) => sendEmail(...args),
  getCurrentUTCTime,
  saveToS3,
  apiKeyGeneration,
  createAccessToken,
  upload,
  generateVerificationEmail
}

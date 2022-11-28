handlebars = require('handlebars');
const mongoose = require('mongoose');
const shortid = require('shortid');
let helper = require("../lib/common-helper")
const { constants, messages } = require("../constants.js");


// const apierrlog = mongoose.model('apiErrorLogs');

let log = async (...args) => {
  try {
    let reqBody = { ...args[1].body, ...args[1].headers, ...args[1].query, ...args[1].params }
    if (constants.is_debug) {
      let res = [];
      res.push(args[2])
      if (constants.DEBUG_TYPE == "email") {
        to_id = "yash.gloryautotech@gmail.com",
          subject = (args[6]) ? 'API Log' : 'API Error Logs',
          template_name = 'apiErrorLogs.html'
        let errlog = {
          apiName: args[0],
          apiUrl: args[1].url,
          requestBody: JSON.stringify(reqBody),
          responseBody: JSON.stringify(res)
        }
        helper.sendEmail(from_id, to_id, subject, template_name, errlog);
      }
      else if (constants.DEBUG_TYPE == "database") {
        let errlog = new apierrlog({
          errid: shortid.generate(),
          apiName: args[0],
          apiUrl: args[1].url,
          requestBody: JSON.stringify(reqBody),
          responseBody: JSON.stringify(res)
        })
        await errlog.save();
      }
      else if (constants.DEBUG_TYPE == "both") {
        to_id = "yash.gloryautotech@gmail.com",
          subject = (args[6]) ? 'API Log' : 'API Error Logs',
          template_name = 'apiErrorLogs.html'
        let errlog = new apierrlog({
          errid: shortid.generate(),
          apiName: args[0],
          apiUrl: args[1].url,
          requestBody: JSON.stringify(reqBody),
          responseBody: JSON.stringify(res)
        })
        await errlog.save();
      }
    }
  }
  catch (err) {
    to_id = "yash.gloryautotech@gmail.com",
      subject = 'API Error Logs',
      template_name = 'apiErrorLogs.html';
    let errlog = new apierrlog({
      errid: shortid.generate(),
      apiName: "logger helper",
      responseBody: err,
    })
  }
}
module.exports = {
  log: async (...args) => {

    log(...args);

  }
}

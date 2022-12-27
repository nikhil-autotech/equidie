
const response = require('../lib/responseLib');
const { constants, messages } = require("../constants.js");
const APIFeatures = require('../utils/apiFeatures');
const notificationModel = require('../model/notification-logger');

exports.getAll = async (req, res, next) => {
    try {
        const features = new APIFeatures(notificationModel.find({}), req.query).sort();

        const notificationData = await features.query;
        if (notificationData && notificationData.lenght) {
            notificationData = notificationData.filter(v => !v.seen);
        }
        const responeData = JSON.parse(JSON.stringify(notificationData));

        let apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);
        res.status(200).send(apiResponse)
    } catch (error) {
        res.json({
            status: 400,
            message: error.message,
        });
    }
};
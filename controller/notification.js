
const response = require('../lib/responseLib');
const { constants, messages } = require("../constants.js");
const APIFeatures = require('../utils/apiFeatures');
const notificationModel = require('../model/notification-logger');

exports.getAll = async (req, res, next) => {
    try {
        const features = new APIFeatures(notificationModel.find({}), req.query).sort();

        let notificationData = await features.query;
        let mainArray = [];
        if (req.query.role == 'Admin') {

            if (notificationData && notificationData.length) {
                mainArray = notificationData.filter(v => !v.seen && v.type == 'User');
            }

            if (mainArray && mainArray.length < 15) {
                mainArray = [...mainArray,...notificationData.filter(v => v.seen && v.type == 'User')];
            }

            notificationData = mainArray.slice(0,15);

        } else if (req.query.role == 'User') {

            if (notificationData && notificationData.length) {
                mainArray = notificationData.filter(v => !v.seen && v.type == 'Admin' && v.userId == req.query.userId);
            }

            if (mainArray && mainArray.length < 15) {
                mainArray = [...mainArray,...notificationData.filter(v => v.seen && v.type == 'Admin' && v.userId == req.query.userId)];
            }

            notificationData = mainArray.slice(0,15);

        }

        const responeData = JSON.parse(JSON.stringify(notificationData));

        let apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);

        let copy = [...responeData];
        copy = copy.map(ele => ele._id);

        await notificationModel.updateMany({ _id: { $in: copy } }, { $set: { seen: true } });

        res.status(200).send(apiResponse)
    } catch (error) {
        res.json({
            status: 400,
            message: error.message,
        });
    }
};
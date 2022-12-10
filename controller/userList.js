const mongoose = require("mongoose");
const response = require('../lib/responseLib');
const { constants, messages } = require("../constants.js");
const APIFeatures = require('../utils/apiFeatures');
const userListModel = require('../model/userList');


exports.getAll = async (req, res, next) => {
	try {
		const features = new APIFeatures(userListModel.find({}),req.query)
			.sort()
			.limitFields()
			.paginate()
			.filter();
		const userListData = await features.query;
		const responeData = JSON.parse(JSON.stringify(userListData));
		
       let  apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);
       res.status(200).send(apiResponse)
	} catch (error) {
		res.json({
			status: 400,
			message: error.message,
		});
	}
};

exports.filterData = async (req, res, next) => {
	try {
		const features = new APIFeatures(userListModel.find({}),req.body)
			.sort()
			.limitFields()
			.paginate()
			.filter();
		const userListData = await features.query;
		const responeData = JSON.parse(JSON.stringify(userListData));
		
       let  apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);
       res.status(200).send(apiResponse)
	} catch (error) {
		res.json({
			status: 400,
			message: error.message,
		});
	}
};
exports.getUserById = async (req, res, next) => {
    try {
        const userData = await userModel.findOne({ _id: req.body.id }).select('-__v -_id').lean();
        if (!userData) {
            apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse);
        }
        else {
            apiResponse = response.generate(constants.SUCCESS, messages.USER.FETCHEDSUCCESS, constants.HTTP_SUCCESS, userData);
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        res.status(400).json({
            status: 'fails',
            message: err.message,
        });
    }
};
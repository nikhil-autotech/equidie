const mongoose = require("mongoose");
const response = require('../lib/responseLib');
const { constants, messages } = require("../constants.js");
const APIFeatures = require('../utils/apiFeatures');
const userListModel = require('../model/userList');


exports.GetAll = async (req, res, next) => {
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
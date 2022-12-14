const mongoose = require("mongoose");
const response = require('../lib/responseLib');
const { constants, messages } = require("../constants.js");
const APIFeatures = require('../utils/apiFeatures');
const userListModel = require('../model/userList');
const userModel = require('../model/user');


exports.getAll = async (req, res, next) => {
    try {
        const features = new APIFeatures(userListModel.find({}), req.query)
            .sort()
            .limitFields()
            .paginate()
            .filter();
        const userListData = await features.query;
        const responeData = JSON.parse(JSON.stringify(userListData));

        let apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);
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
        const features = new APIFeatures(userListModel.find({}), req.body)
            .sort()
            .limitFields()
            .paginate()
            .filter();
        const userListData = await features.query;
        const responeData = JSON.parse(JSON.stringify(userListData));

        let apiResponse = response.generate(constants.SUCCESS, `Fetched Successfully`, constants.HTTP_SUCCESS, responeData);
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
        const userData = await userModel.findOne({ _id: req.params.id }).select('-__v -_id').lean();
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
exports.verify = async (req, res, next) => {
    try {
        let apiResponse;
        let userData = await userModel.findOne({ _id: req.body.id });
        if (!userData) {
            apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse);
        }
        else {
            userData.PAN.status = req.body.personalKYC.PAN.status;
            userData.PAN.message = req.body.personalKYC.PAN.message ? req.body.personalKYC.PAN.message : '';
            userData.aadhar.status = req.body.personalKYC.aadhar.status;
            userData.aadhar.message = req.body.personalKYC.aadhar.message ? req.body.personalKYC.aadhar.message : '';
            userData.companyDetails.PAN.status = req.body.businessKYC.PAN.status;
            userData.companyDetails.PAN.message = req.body.businessKYC.PAN.message ? req.body.businessKYC.PAN.message : '';
            userData.companyDetails.udhyamDetails.status = req.body.businessKYC.udhyamDetails.status;
            userData.companyDetails.udhyamDetails.message = req.body.businessKYC.udhyamDetails.message ? req.body.businessKYC.udhyamDetails.message : '';
            userData.companyDetails.GST.status = req.body.businessKYC.GST.status;
            userData.companyDetails.GST.message = req.body.businessKYC.GST.message ? req.body.businessKYC.GST.message : '';
            userData.companyDetails.currentOutstandingLoan.status = req.body.businessKYC.currentOutstandingLoan.status;
            userData.companyDetails.currentOutstandingLoan.message = req.body.businessKYC.currentOutstandingLoan.message ? req.body.businessKYC.currentOutstandingLoan.message : '';
            userData.companyDetails.bankDetails.bankStatement.status = req.body.businessKYC.bankStatement.status;
            userData.companyDetails.bankDetails.bankStatement.message = req.body.businessKYC.bankStatement.message ? req.body.businessKYC.bankStatement.message : '';
            userData.companyDetails.profitLossStatement.status = req.body.businessKYC.profitLossStatement.status;
            userData.companyDetails.profitLossStatement.message = req.body.businessKYC.profitLossStatement.message ? req.body.businessKYC.profitLossStatement.message : '';
            userData.companyDetails.incomeTaxReturn.status = req.body.businessKYC.incomeTaxReturn.status;
            userData.companyDetails.incomeTaxReturn.message = req.body.businessKYC.incomeTaxReturn.message ? req.body.businessKYC.incomeTaxReturn.message : '';
            userData = await userData.save();

            if (userData.PAN.status == 'Verified' && userData.aadhar.status == 'Verified' && userData.companyDetails.PAN.status == 'Verified' && userData.companyDetails.udhyamDetails.status == 'Verified' && userData.companyDetails.GST.status == 'Verified' && userData.companyDetails.currentOutstandingLoan.status == 'Verified' && userData.companyDetails.bankDetails.bankStatement.status == 'Verified' && userData.companyDetails.profitLossStatement.status == 'Verified' && userData.companyDetails.incomeTaxReturn.status == 'Verified') 
            {
                await userListModel.findOneAndUpdate({ userId: req.body.id }, { $set: { status: 'Completed' } }, { new: true });
            }
            else if (userData.PAN.status == 'Verified' || userData.aadhar.status == 'Verified' || userData.companyDetails.PAN.status == 'Verified' || userData.companyDetails.udhyamDetails.status == 'Verified' || userData.companyDetails.GST.status == 'Verified' || userData.companyDetails.currentOutstandingLoan.status == 'Verified' || userData.companyDetails.bankDetails.bankStatement.status == 'Verified' || userData.companyDetails.profitLossStatement.status == 'Verified' || userData.companyDetails.incomeTaxReturn.status == 'Verified') 
                {
                await userListModel.findOneAndUpdate({ userId: req.body.id }, { $set: { status: 'Updated By MSME' } }, { new: true });
            }
            else {
                await userListModel.findOneAndUpdate({ userId: req.body.id }, { $set: { status: 'Rejected' } }, { new: true });
            }
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
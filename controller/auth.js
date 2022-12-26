const mongoose = require("mongoose");
const response = require("../lib/responseLib");
const logger = require("../lib/logger-helper");
const { constants, messages } = require("../constants.js");
const jwt = require("jsonwebtoken");
const accessTokenSecret = "youraccesstokensecret";
const passwordUtil = require("../utils/password");
const buildResponse = require("../utils/buildResponse");
const userModel = require("../model/user");
const userListModel = require("../model/userList");
const zipCodeModel = require("../model/zipCode");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const regex = new RegExp(
    /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
);

let registration = async (req, res) => {
    try {
        let isTrue = regex.test(req.body.userId);
        const isUserExist = isTrue
            ? await userModel.findOne({ email: req.body.userId }).lean()
            : await userModel.findOne({ mobile: req.body.userId }).lean();
        if (!isUserExist) {
            let createUser = isTrue
                ? new userModel({
                    _id: new mongoose.Types.ObjectId(),
                    role: req.body.role ? req.body.role : "User",
                    password: req.body.password,
                    orgName: req.body.orgName,
                    product: req.body.product,
                    adminName: req.body.adminName,
                    email: req.body.userId,
                    companyDetails: {
                        name: req.body.orgName,
                        product: req.body.product,
                    },
                })
                : new userModel({
                    _id: new mongoose.Types.ObjectId(),
                    role: req.body.role ? req.body.role : "User",
                    password: req.body.password,
                    orgName: req.body.orgName,
                    product: req.body.product,
                    adminName: req.body.adminName,
                    mobile: req.body.userId,
                    companyDetails: {
                        name: req.body.orgName,
                        product: req.body.product,
                    },
                });
            await createUser.save().then();
            await sendOTP(req, res);
            // let apiResponse = response.generate(constants.SUCCESS, messages.USER.SUCCESS, constants.HTTP_SUCCESS, userData)
            // res.status(200).send(apiResponse)
        } else {
            let apiResponse;
            if (!isUserExist.otpVerified) {
                await sendOTP(req, res);
            } else {
                apiResponse = response.generate(
                    constants.ERROR,
                    messages.USER.ALREADYEXIST,
                    constants.HTTP_SERVER_ERROR,
                    null
                );
                res.status(400).send(apiResponse);
            }
        }
    } catch (err) {
        let apiResponse = response.generate(
            constants.ERROR,
            messages.USER.FAILURE,
            constants.HTTP_SERVER_ERROR,
            err
        );
        res.status(500).send(apiResponse);
    }
};

let companyDetails = async (req, res) => {
    try {
        let profileCompletion = 30;
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue
            ? await userModel
                .findOne({ email: req.body.userId, isCompanyKYCPartial: false })
                .lean()
            : await userModel
                .findOne({ mobile: req.body.userId, isCompanyKYCPartial: false })
                .lean();
        if (isUserExist) {
            let data = isUserExist;
            data["KYCBussiness"] = {};
            if (req.body.companyDetails.PAN) {
                data.companyDetails.PAN.name = req.body.companyDetails.PAN.name
                    ? req.body.companyDetails.PAN.name
                    : req.body.companyDetails.PAN?.name == ""
                        ? ""
                        : data.companyDetails.PAN.name;
                data.companyDetails.PAN.panNumber = req.body.companyDetails.PAN
                    .panNumber
                    ? req.body.companyDetails.PAN.panNumber
                    : req.body.companyDetails.PAN?.panNumber == ""
                        ? ""
                        : data.companyDetails.PAN.panNumber;
                data.companyDetails.PAN.file = req.body.companyDetails.PAN.file
                    ? req.body.companyDetails.PAN.file
                    : req.body.companyDetails.PAN?.file == ""
                        ? ""
                        : data.companyDetails.PAN.file;
                if (
                    req.body.companyDetails.PAN.panNumber &&
                    req.body.companyDetails.PAN.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isPANSubmitted"] = true;
                }
            }
            if (req.body.companyDetails.udhyamDetails) {
                data.companyDetails.udhyamDetails.name = req.body.companyDetails
                    .udhyamDetails.name
                    ? req.body.companyDetails.udhyamDetails.name
                    : req.body.companyDetails.udhyamDetails?.name == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.name;
                data.companyDetails.udhyamDetails.udhyamNumber = req.body.companyDetails
                    .udhyamDetails.udhyamNumber
                    ? req.body.companyDetails.udhyamDetails.udhyamNumber
                    : req.body.companyDetails.udhyamDetails?.udhyamNumber == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.udhyamNumber;
                data.companyDetails.udhyamDetails.file = req.body.companyDetails
                    .udhyamDetails.file
                    ? req.body.companyDetails.udhyamDetails.file
                    : req.body.companyDetails.udhyamDetails?.file == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.file;
                if (
                    req.body.companyDetails.udhyamDetails.udhyamNumber &&
                    req.body.companyDetails.udhyamDetails.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["udhyamDetailsSubmitted"] = true;
                }
            }
            if (req.body.companyDetails.GST) {
                data.companyDetails.GST.name = req.body.companyDetails.GST.name
                    ? req.body.companyDetails.GST.name
                    : req.body.companyDetails.GST?.name == ""
                        ? ""
                        : data.companyDetails.GST.name;
                data.companyDetails.GST.GSTNumber = req.body.companyDetails.GST
                    .GSTNumber
                    ? req.body.companyDetails.GST.GSTNumber
                    : req.body.companyDetails.GST?.GSTNumber == ""
                        ? ""
                        : data.companyDetails.GST.GSTNumber;
                data.companyDetails.GST.file = req.body.companyDetails.GST.file
                    ? req.body.companyDetails.GST.file
                    : req.body.companyDetails.GST?.file == ""
                        ? ""
                        : data.companyDetails.GST.file;
                if (
                    req.body.companyDetails.GST.GSTNumber &&
                    req.body.companyDetails.GST.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isGSTSubmitted"] = true;
                }
            }
            if (
                req.body.companyDetails.bankDetails &&
                req.body.companyDetails.bankDetails.bankStatement
            ) {
                data.companyDetails.bankDetails.bankStatement.name = req.body
                    .companyDetails.bankDetails.bankStatement.name
                    ? req.body.companyDetails.bankDetails.bankStatement.name
                    : req.body.companyDetails.bankDetails.bankStatement?.name == ""
                        ? ""
                        : data.companyDetails.bankDetails.bankStatement.name;
                data.companyDetails.bankDetails.bankStatement.file = req.body
                    .companyDetails.bankDetails.bankStatement.file
                    ? req.body.companyDetails.bankDetails.bankStatement.file
                    : req.body.companyDetails.bankDetails.bankStatement?.file == ""
                        ? ""
                        : data.companyDetails.bankDetails.bankStatement.file;
                if (
                    req.body.companyDetails.bankDetails.bankStatement.name &&
                    req.body.companyDetails.bankDetails.bankStatement.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isStatementSubmitted"] = true;
                }
            }
            if (req.body.companyDetails.profitLossStatement) {
                data.companyDetails.profitLossStatement.name = req.body.companyDetails
                    .profitLossStatement.name
                    ? req.body.companyDetails.profitLossStatement.name
                    : req.body.companyDetails.profitLossStatement?.name == ""
                        ? ""
                        : data.companyDetails.profitLossStatement.name;
                data.companyDetails.profitLossStatement.file = req.body.companyDetails
                    .profitLossStatement.file
                    ? req.body.companyDetails.profitLossStatement.file
                    : req.body.companyDetails.profitLossStatement?.file == ""
                        ? ""
                        : data.companyDetails.profitLossStatement.file;
                if (
                    req.body.companyDetails.profitLossStatement.name &&
                    req.body.companyDetails.profitLossStatement.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isProfitLossSubmitted"] = true;
                }
            }
            if (req.body.companyDetails.incomeTaxReturn) {
                data.companyDetails.incomeTaxReturn.name = req.body.companyDetails
                    .incomeTaxReturn.name
                    ? req.body.companyDetails.incomeTaxReturn.name
                    : req.body.companyDetails.incomeTaxReturn?.name == ""
                        ? ""
                        : data.companyDetails.incomeTaxReturn.name;
                data.companyDetails.incomeTaxReturn.file = req.body.companyDetails
                    .incomeTaxReturn.file
                    ? req.body.companyDetails.incomeTaxReturn.file
                    : req.body.companyDetails.incomeTaxReturn?.file == ""
                        ? ""
                        : data.companyDetails.incomeTaxReturn.file;
                if (
                    req.body.companyDetails.incomeTaxReturn.name &&
                    req.body.companyDetails.incomeTaxReturn.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isIncomeTaxSubmitted"] = true;
                }
            }
            if (req.body.companyDetails.currentOutstandingLoan) {
                if (
                    req.body.companyDetails.currentOutstandingLoan.name &&
                    req.body.companyDetails.currentOutstandingLoan.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isCurrentOutStandingLoan"] = true;
                }
            }
            data.companyDetails.name = req.body.companyDetails.name
                ? req.body.companyDetails.name
                : req.body.companyDetails?.name == ""
                    ? ""
                    : data.companyDetails.name;
            data.companyDetails.product = req.body.companyDetails.product
                ? req.body.companyDetails.product
                : req.body.companyDetails?.product == ""
                    ? ""
                    : data.companyDetails.product;
            data.companyDetails.yearOfIncorporation = req.body.companyDetails
                .yearOfIncorporation
                ? req.body.companyDetails.yearOfIncorporation
                : req.body.companyDetails?.yearOfIncorporation == ""
                    ? ""
                    : data.companyDetails.yearOfIncorporation;
            data.companyDetails.industryType = req.body.companyDetails.industryType
                ? req.body.companyDetails.industryType
                : req.body.companyDetails?.industryType == ""
                    ? ""
                    : data.companyDetails.industryType;
            data.companyDetails.licenseNumber = req.body.companyDetails.licenseNumber
                ? req.body.companyDetails.licenseNumber
                : req.body.companyDetails?.licenseNumber == ""
                    ? ""
                    : data.companyDetails.licenseNumber;
            // data.companyDetails.bankDetails.bankName = req.body.companyDetails.bankDetails?.bankName ? req.body.companyDetails.bankDetails.bankName : req.body.companyDetails.bankDetails?.bankName == '' ? '' : data.companyDetails.bankDetails.bankName;
            data.companyDetails.bankDetails.accountNumber = req.body.companyDetails
                .bankDetails?.accountNumber
                ? req.body.companyDetails.bankDetails.accountNumber
                : req.body.companyDetails.bankDetails?.accountNumber == ""
                    ? ""
                    : data.companyDetails.bankDetails.accountNumber;
            data.companyDetails.bankDetails.IFSC = req.body.companyDetails.bankDetails
                ?.IFSC
                ? req.body.companyDetails.bankDetails.IFSC
                : req.body.companyDetails.bankDetails?.IFSC == ""
                    ? ""
                    : data.companyDetails.bankDetails.IFSC;
            data.companyDetails.bankDetails.branchName = req.body.companyDetails
                .bankDetails?.branchName
                ? req.body.companyDetails.bankDetails.branchName
                : req.body.companyDetails.bankDetails?.branchName == ""
                    ? ""
                    : data.companyDetails.bankDetails.branchName;
            data.companyDetails.address = req.body.companyDetails.address
                ? req.body.companyDetails.address
                : req.body.companyDetails?.address == ""
                    ? ""
                    : data.companyDetails.address;
            data.companyDetails.zip = req.body.companyDetails.zip
                ? req.body.companyDetails.zip
                : req.body.companyDetails?.zip == ""
                    ? ""
                    : data.companyDetails.zip;
            data.companyDetails.city = req.body.companyDetails.city
                ? req.body.companyDetails.city
                : req.body.companyDetails?.city == ""
                    ? ""
                    : data.companyDetails.city;
            data.companyDetails.state = req.body.companyDetails.state
                ? req.body.companyDetails.state
                : req.body.companyDetails?.state == ""
                    ? ""
                    : data.companyDetails.state;
            if (
                data.companyDetails.name &&
                data.companyDetails.product &&
                data.companyDetails.yearOfIncorporation &&
                data.companyDetails.industryType &&
                data.companyDetails.licenseNumber &&
                data.companyDetails.GST.GSTNumber &&
                data.companyDetails.PAN.panNumber &&
                data.companyDetails.udhyamDetails.udhyamNumber &&
                data.companyDetails.bankDetails.accountNumber &&
                data.companyDetails.bankDetails.IFSC &&
                data.companyDetails.bankDetails.branchName &&
                data.companyDetails.address &&
                data.companyDetails.zip &&
                data.companyDetails.city &&
                data.companyDetails.state
            ) {
                //&& data.companyDetails.bankDetails.bankName
                data["isAllCompanyInfoAvailable"] = true;
                data.profileCompletion = profileCompletion + 43.75;
            } else {
                data["isAllCompanyInfoAvailable"] = false;
                if (data.companyDetails.name) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.product) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.yearOfIncorporation) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.industryType) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.licenseNumber) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.GST.GSTNumber) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.udhyamDetails.udhyamNumber) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.PAN.panNumber) {
                    profileCompletion = profileCompletion + 2.91;
                }
                // if (data.companyDetails.bankDetails.bankName) {
                //     profileCompletion = profileCompletion + 2.91;
                // }
                if (data.companyDetails.bankDetails.accountNumber) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.bankDetails.IFSC) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.bankDetails.branchName) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.address) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.zip) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.city) {
                    profileCompletion = profileCompletion + 2.91;
                }
                if (data.companyDetails.state) {
                    profileCompletion = profileCompletion + 2.91;
                }
                data.profileCompletion = profileCompletion;
            }
            if (
                data.KYCBussiness.isPANSubmitted == true &&
                data.KYCBussiness.udhyamDetailsSubmitted == true &&
                data.KYCBussiness.isGSTSubmitted == true &&
                data.KYCBussiness.isStatementSubmitted == true &&
                data.KYCBussiness.isProfitLossSubmitted == true &&
                data.KYCBussiness.isIncomeTaxSubmitted == true &&
                data.KYCBussiness.isCurrentOutStandingLoan == true
            ) {
                data["isBussinesKYCDone"] = true;
            }
            isUserExist = isTrue
                ? await userModel
                    .findOneAndUpdate({ email: req.body.userId }, data, { new: true })
                    .lean()
                : await userModel
                    .findOneAndUpdate({ mobile: req.body.userId }, data, { new: true })
                    .lean();
            let apiResponse = response.generate(
                constants.SUCCESS,
                "Your information has been updated",
                constants.HTTP_SUCCESS,
                isUserExist
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.ALREADYKYCDONE,
                constants.HTTP_UNAUTHORIZED,
                null
            );
            res.status(400).send(apiResponse);
        }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(
            constants.ERROR,
            messages.USER.FAILURE,
            constants.HTTP_SERVER_ERROR,
            err
        );
        res.status(500).send(apiResponse);
    }
};

let personalKYC = async (req, res) => {
    try {
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue
            ? await userModel.findOne({ email: req.body.userId }).lean()
            : await userModel.findOne({ mobile: req.body.userId }).lean();
        if (isUserExist) {
            let data = isUserExist;
            data["KYCPersonal"] = {};
            if (req.body.PAN) {
                data.PAN.name = req.body.PAN.name
                    ? req.body.PAN.name
                    : req.body.PAN?.name == ""
                        ? ""
                        : data.PAN.name;
                data.PAN.panNumber = req.body.PAN.panNumber
                    ? req.body.PAN.panNumber
                    : req.body.PAN?.panNumber == ""
                        ? ""
                        : data.PAN.panNumber;
                data.PAN.file = req.body.PAN.file
                    ? req.body.PAN.file
                    : req.body.PAN?.file == ""
                        ? ""
                        : data.PAN.file;
                if (data.PAN.name && data.PAN.file) {
                    data.isKYCPartial = true;
                    data.KYCPersonal["isPANSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.aadhar) {
                data.aadhar.name = req.body.aadhar.name
                    ? req.body.aadhar.name
                    : req.body.aadhar?.name == ""
                        ? ""
                        : data.aadhar.name;
                data.aadhar.aadharNumber = req.body.aadhar.aadharNumber
                    ? req.body.aadhar.aadharNumber
                    : req.body.aadhar?.aadharNumber == ""
                        ? ""
                        : data.aadhar.aadharNumber;
                data.aadhar.file = req.body.aadhar.file
                    ? req.body.aadhar.file
                    : req.body.aadhar?.file == ""
                        ? ""
                        : data.aadhar.file;
                if (data.aadhar.name && data.aadhar.file) {
                    data.isKYCPartial = true;
                    data.KYCPersonal["isAadharSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }

            let changedDocumnets =
                req.body.changedDocumnets && req.body.changedDocumnets.length
                    ? req.body.changedDocumnets
                    : [];
            if (changedDocumnets && changedDocumnets.length) {
                changedDocumnets.forEach((element) => {

                    if (req.body[element]) {
                        data[element].status = "Updated By MSME";
                    }

                });
            }

            if (
                data.KYCPersonal["isPANSubmitted"] == true &&
                data.KYCPersonal["isAadharSubmitted"] == true
            ) {
                data["isPersonalKYCDone"] = true;
            }
            isUserExist = isTrue
                ? await userModel
                    .findOneAndUpdate({ email: req.body.userId }, data, { new: true })
                    .lean()
                : await userModel
                    .findOneAndUpdate({ mobile: req.body.userId }, data, { new: true })
                    .lean();
            let apiResponse = response.generate(
                constants.SUCCESS,
                "Personal KYC has been updated",
                constants.HTTP_SUCCESS,
                isUserExist
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.ALREADYKYCDONE,
                constants.HTTP_UNAUTHORIZED,
                null
            );
            res.status(400).send(apiResponse);
        }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(
            constants.ERROR,
            messages.USER.FAILURE,
            constants.HTTP_SERVER_ERROR,
            err
        );
        res.status(500).send(apiResponse);
    }
};

let businessKYC = async (req, res) => {
    try {
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue
            ? await userModel.findOne({ email: req.body.userId }).lean()
            : await userModel.findOne({ mobile: req.body.userId }).lean();
        if (isUserExist) {
            let data = isUserExist;
            data["KYCBussiness"] = {};
            if (req.body.companyDetails.PAN) {
                data.companyDetails.PAN.name = req.body.companyDetails.PAN.name
                    ? req.body.companyDetails.PAN.name
                    : req.body.companyDetails.PAN?.name == ""
                        ? ""
                        : data.companyDetails.PAN.name;
                data.companyDetails.PAN.panNumber = req.body.companyDetails.PAN
                    .panNumber
                    ? req.body.companyDetails.PAN.panNumber
                    : req.body.companyDetails.PAN?.panNumber == ""
                        ? ""
                        : data.companyDetails.PAN.panNumber;
                data.companyDetails.PAN.file = req.body.companyDetails.PAN.file
                    ? req.body.companyDetails.PAN.file
                    : req.body.companyDetails.PAN?.file == ""
                        ? ""
                        : data.companyDetails.PAN.file;
                if (
                    data.companyDetails.PAN.name &&
                    data.companyDetails.PAN.panNumber &&
                    data.companyDetails.PAN.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isPANSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.udhyamDetails) {
                data.companyDetails.udhyamDetails.name = req.body.companyDetails
                    .udhyamDetails.name
                    ? req.body.companyDetails.udhyamDetails.name
                    : req.body.companyDetails.udhyamDetails?.name == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.name;
                data.companyDetails.udhyamDetails.udhyamNumber = req.body.companyDetails
                    .udhyamDetails.udhyamNumber
                    ? req.body.companyDetails.udhyamDetails.udhyamNumber
                    : req.body.companyDetails.udhyamDetails?.udhyamNumber == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.udhyamNumber;
                data.companyDetails.udhyamDetails.file = req.body.companyDetails
                    .udhyamDetails.file
                    ? req.body.companyDetails.udhyamDetails.file
                    : req.body.companyDetails.udhyamDetails?.file == ""
                        ? ""
                        : data.companyDetails.udhyamDetails.file;
                if (
                    data.companyDetails.udhyamDetails.name &&
                    data.companyDetails.udhyamDetails.udhyamNumber &&
                    data.companyDetails.udhyamDetails.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["udhyamDetailsSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.GST) {
                data.companyDetails.GST.name = req.body.companyDetails.GST.name
                    ? req.body.companyDetails.GST.name
                    : req.body.companyDetails.GST?.name == ""
                        ? ""
                        : data.companyDetails.GST.name;
                data.companyDetails.GST.GSTNumber = req.body.companyDetails.GST
                    .GSTNumber
                    ? req.body.companyDetails.GST.GSTNumber
                    : req.body.companyDetails.GST?.GSTNumber == ""
                        ? ""
                        : data.companyDetails.GST.GSTNumber;
                data.companyDetails.GST.file = req.body.companyDetails.GST.file
                    ? req.body.companyDetails.GST.file
                    : req.body.companyDetails.GST?.file == ""
                        ? ""
                        : data.companyDetails.GST.file;
                if (
                    data.companyDetails.GST.name &&
                    data.companyDetails.GST.GSTNumber &&
                    data.companyDetails.GST.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isGSTSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.bankDetails) {
                data.companyDetails.bankDetails.bankStatement.name = req.body
                    .companyDetails.bankDetails.bankStatement.name
                    ? req.body.companyDetails.bankDetails.bankStatement.name
                    : req.body.companyDetails.bankDetails.bankStatement?.name == ""
                        ? ""
                        : data.companyDetails.bankDetails.bankStatement.name;
                data.companyDetails.bankDetails.bankStatement.file = req.body
                    .companyDetails.bankDetails.bankStatement.file
                    ? req.body.companyDetails.bankDetails.bankStatement.file
                    : req.body.companyDetails.bankDetails.bankStatement?.file == ""
                        ? ""
                        : data.companyDetails.bankDetails.bankStatement.file;
                if (
                    data.companyDetails.bankDetails.bankStatement.name &&
                    data.companyDetails.bankDetails.bankStatement.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isStatementSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.profitLossStatement) {
                data.companyDetails.profitLossStatement.name = req.body.companyDetails
                    .profitLossStatement.name
                    ? req.body.companyDetails.profitLossStatement.name
                    : req.body.companyDetails.profitLossStatement?.name == ""
                        ? ""
                        : data.companyDetails.profitLossStatement.name;
                data.companyDetails.profitLossStatement.file = req.body.companyDetails
                    .profitLossStatement.file
                    ? req.body.companyDetails.profitLossStatement.file
                    : req.body.companyDetails.profitLossStatement?.file == ""
                        ? ""
                        : data.companyDetails.profitLossStatement.file;
                if (
                    data.companyDetails.profitLossStatement.name &&
                    data.companyDetails.profitLossStatement.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isProfitLossSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.incomeTaxReturn) {
                data.companyDetails.incomeTaxReturn.name = req.body.companyDetails
                    .incomeTaxReturn.name
                    ? req.body.companyDetails.incomeTaxReturn.name
                    : req.body.companyDetails.incomeTaxReturn?.name == ""
                        ? ""
                        : data.companyDetails.incomeTaxReturn.name;
                data.companyDetails.incomeTaxReturn.file = req.body.companyDetails
                    .incomeTaxReturn.file
                    ? req.body.companyDetails.incomeTaxReturn.file
                    : req.body.companyDetails.incomeTaxReturn?.file == ""
                        ? ""
                        : data.companyDetails.incomeTaxReturn.file;
                if (
                    data.companyDetails.incomeTaxReturn.name &&
                    data.companyDetails.incomeTaxReturn.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isIncomeTaxSubmitted"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }
            if (req.body.companyDetails.currentOutstandingLoan) {
                data.companyDetails.currentOutstandingLoan.name = req.body
                    .companyDetails.currentOutstandingLoan.name
                    ? req.body.companyDetails.currentOutstandingLoan.name
                    : req.body.companyDetails.currentOutstandingLoan?.name == ""
                        ? ""
                        : data.companyDetails.currentOutstandingLoan.name;
                data.companyDetails.currentOutstandingLoan.file = req.body
                    .companyDetails.currentOutstandingLoan.file
                    ? req.body.companyDetails.currentOutstandingLoan.file
                    : req.body.companyDetails.currentOutstandingLoan?.file == ""
                        ? ""
                        : data.companyDetails.currentOutstandingLoan.file;
                if (
                    data.companyDetails.currentOutstandingLoan.name &&
                    data.companyDetails.currentOutstandingLoan.file
                ) {
                    data.isKYCPartial = true;
                    data.KYCBussiness["isCurrentOutStandingLoan"] = true;
                    data.profileCompletion = data.profileCompletion + 2.91;
                }
            }

            let changedDocumnets =
                req.body.changedDocumnets && req.body.changedDocumnets.length
                    ? req.body.changedDocumnets
                    : [];
            if (changedDocumnets && changedDocumnets.length) {
                changedDocumnets.forEach((element) => {
                    if (element == "bankDetails") {
                        if (req.body.companyDetails[element]) {
                            data.companyDetails[element].bankStatement.status =
                                "Updated By MSME";
                        }
                    } else {
                        if (req.body.companyDetails[element]) {
                            data.companyDetails[element].status = "Updated By MSME";
                        }
                    }
                });
            }

            if (
                data.KYCBussiness.isPANSubmitted == true &&
                data.KYCBussiness.udhyamDetailsSubmitted == true &&
                data.KYCBussiness.isGSTSubmitted == true &&
                data.KYCBussiness.isStatementSubmitted == true &&
                data.KYCBussiness.isProfitLossSubmitted == true &&
                data.KYCBussiness.isIncomeTaxSubmitted == true &&
                data.KYCBussiness.isCurrentOutStandingLoan == true
            ) {
                data["isBussinesKYCDone"] = true;
            }
            isUserExist = isTrue
                ? await userModel
                    .findOneAndUpdate({ email: req.body.userId }, data, { new: true })
                    .lean()
                : await userModel
                    .findOneAndUpdate({ mobile: req.body.userId }, data, { new: true })
                    .lean();
            let apiResponse = response.generate(
                constants.SUCCESS,
                "Bussiness KYC has been updated",
                constants.HTTP_SUCCESS,
                isUserExist
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.ALREADYKYCDONE,
                constants.HTTP_UNAUTHORIZED,
                null
            );
            res.status(400).send(apiResponse);
        }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(
            constants.ERROR,
            messages.USER.FAILURE,
            constants.HTTP_SERVER_ERROR,
            err
        );
        res.status(500).send(apiResponse);
    }
};

let login = async (req, res) => {
    try {
        const { password } = req.body;
        let isTrue = regex.test(req.body.userId);
        const getUser = isTrue
            ? await userModel
                .findOne({ email: req.body.userId })
                .select("-createdAt -orgName -updatedAt -product -__v")
            : await userModel
                .findOne({ mobile: req.body.userId })
                .select("-createdAt -orgName -updatedAt -product -__v");
        if (getUser.otpVerified) {
            const resData = {};
            if (
                getUser &&
                getUser.password &&
                (await getUser.comparePassword(password))
            ) {
                console.log(getUser);
                resData.token = passwordUtil.genJwtToken(getUser._id);
                resData.user = JSON.parse(JSON.stringify(getUser));
                resData.user.userId = req.body.userId;
            } else {
                let apiResponse = response.generate(
                    constants.ERROR,
                    messages.LOGIN.FAILURE,
                    constants.HTTP_UNAUTHORIZED
                );
                res.status(400).send(apiResponse);
                return;
            }
            let apiResponse = isTrue
                ? response.generate(
                    constants.SUCCESS,
                    `Welcome ${resData.user.email}!` /*messages.LOGIN.SUCCESS*/,
                    constants.HTTP_SUCCESS,
                    resData
                )
                : response.generate(
                    constants.SUCCESS,
                    `Welcome ${resData.user.mobile}!` /*messages.LOGIN.SUCCESS*/,
                    constants.HTTP_SUCCESS,
                    resData
                );
            res.status(200).send(apiResponse);
            return;
        } else {
            let apiResponse = response.generate(
                constants.ERROR,
                messages.USER.INVALIDUSER,
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(400).send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(
            constants.ERROR,
            messages.LOGIN.FAILURE,
            constants.HTTP_SERVER_ERROR,
            err
        );
        res.status(500).send(apiResponse);
        return;
    }
};

const sendMessage = async (email, token) => {
    try {
        const msg = {
            to: email, // Change to your recipient
            from: "kyalharshit@gmail.com", // Change to your verified sender
            subject: "OTP Form EQUIDEI",
            text: `your OTP is ${process.env.OTP}`,
        };
        sgMail
            .send(msg)
            .then(() => {
                console.log("Email sent");
            })
            .catch((error) => {
                console.error(error);
            });
    } catch (err) {
        console.log("sorry for delay");
    }
};

let forgotPassword = async (req, res) => {
    try {
        let userId = req.body.userId;
        let isTrue = regex.test(req.body.userId);
        if (isTrue) {
            let obtainUser = isTrue
                ? await userModel.findOne({ email: userId })
                : await userModel.findOne({ mobile: userId });
            if (obtainUser) {
                let token = jwt.sign(
                    {
                        id: obtainUser._id,
                        userId: isTrue ? obtainUser.email : obtainUser.mobile,
                        expiresIn: "20m",
                    },
                    process.env.JWT_SECRET
                );

                sendMessage(obtainUser.userId, token);
                return res.status(200).send({ status: true, msg: "check your mail" });
            } else {
                return res.status(404).send({ status: true, msg: "User not found" });
            }
        } else {
            return res
                .status(200)
                .send({ status: true, msg: "UserId is not E-mail" });
        }
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
};

let resetPasswordKnownPass = async (req, res) => {
    try {
        let isTrue = regex.test(req.body.userId);
        let obtainUser = isTrue
            ? await userModel.findOne({ email: req.body.userId })
            : await userModel.findOne({ mobile: req.body.userId });
        if (obtainUser) {
            if (
                obtainUser &&
                obtainUser.password &&
                (await obtainUser.comparePassword(req.body.password))
            ) {
                obtainUser.password = req.body.newPassword;
                obtainUser = await obtainUser.save();
                let apiResponse = response.generate(
                    constants.SUCCESS,
                    `your password is successfully reset`,
                    constants.HTTP_SUCCESS,
                    obtainUser
                );
                return res.status(200).send(apiResponse);
            } else {
                let apiResponse = response.generate(
                    constants.ERROR,
                    messages.USER.DOESNOTMATCH,
                    constants.HTTP_UNAUTHORIZED
                );
                res.status(200).send(apiResponse);
                return;
            }
        } else {
            return res.status(404).send({ status: true, msg: "User not found" });
        }
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
};

let resetPassword = async (req, res, next) => {
    try {
        let newPassword = req.body.newPassword;

        const bearerHeader = req.headers["authorization"];
        if (!bearerHeader) {
            let apiResponse = response.generate(
                constants.SUCCESS,
                `Not Authorized`,
                constants.HTTP_UNAUTHORIZED,
                null
            );
            return res.status(401).send(apiResponse);
        }
        const bearer = bearerHeader.split(" ");
        req.token = bearer[1];
        let userData = jwt.verify(req.token, process.env.JWT_SECRET);
        console.log(userData);
        let obtainUser;
        let isTrue = regex.test(userData.userId);
        obtainUser = isTrue
            ? await userModel.findOne({ email: userData.userId })
            : await userModel.findOne({ mobile: userData.userId });
        if (!obtainUser) {
            let apiResponse = response.generate(
                constants.SUCCESS,
                `user not found for this user ${userData.userId}`,
                constants.HTTP_NOT_FOUND,
                null
            );
            return res.status(404).send(apiResponse);
        }
        obtainUser.password = newPassword;
        obtainUser = await obtainUser.save();
        let apiResponse = response.generate(
            constants.SUCCESS,
            `your password is successfully reset`,
            constants.HTTP_SUCCESS,
            obtainUser
        );
        return res.status(200).send(apiResponse);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
};

let sendOTP = async (req, res, next) => {
    try {
        let isTrue = regex.test(req.body.userId);
        let apiResponse;
        let obtainUser = isTrue
            ? await userModel
                .findOne({ email: req.body.userId })
                .select("-createdAt -orgName -updatedAt -product -__v")
                .lean()
            : await userModel
                .findOne({ mobile: req.body.userId })
                .select("-createdAt -orgName -updatedAt -product -__v")
                .lean();
        if (!req.body.changed) {
            if (!obtainUser) {
                res.status(500).send({ message: "This userId is not registered" });
            }
        }

        if (!isTrue) {
            apiResponse = response.generate1(
                constants.SUCCESS,
                obtainUser ? obtainUser.adminName : null,
                `your OTP is sent to this mobile ${req.body.userId}`,
                constants.HTTP_SUCCESS,
                obtainUser
            );
        } else {
            const msg = {
                to: req.body.userId, // Change to your recipient
                from: "kyalharshit@gmail.com", // Change to your verified sender
                subject: "OTP Form EQUIDEI",
                text: `your OTP is ${process.env.OTP}`,
            };
            await sgMail
                .send(msg)
                .then(() => {
                    console.log("Email sent");
                    apiResponse = response.generate1(
                        constants.SUCCESS,
                        obtainUser ? obtainUser.adminName : null,
                        `your OTP sent to this ${req.body.userId} mail Successfully`,
                        constants.HTTP_SUCCESS,
                        obtainUser
                    );
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        return res.status(200).send(apiResponse);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
};

let verifyOTP = async (req, res, next) => {
    try {
        let apiResponse;
        let isTrue = regex.test(req.body.userId);
        if (req.body.changed) {
            isTrue = regex.test(req.body.oldUserId);
            if (req.body.otp == process.env.OTP.toString()) {
                let obtainUser = isTrue
                    ? await userModel.findOne({ email: req.body.oldUserId })
                    : await userModel.findOne({ mobile: req.body.oldUserId });
                if (!obtainUser) {
                    res.status(500).send({ message: "oldUserId does not Exist" });
                } else {
                    if (isTrue) {
                        obtainUser.isEmail = true;
                    } else {
                        obtainUser.isMobile = true;
                    }
                    obtainUser.otpVerified = true;
                    obtainUser = await obtainUser.save();
                    apiResponse = response.generate1(
                        constants.SUCCESS,
                        obtainUser.adminName,
                        `OTP matched successfully`,
                        constants.HTTP_SUCCESS,
                        null
                    );
                }
            } else {
                apiResponse = response.generate1(
                    constants.SUCCESS,
                    obtainUser.adminName,
                    `OTP did not matched`,
                    constants.HTTP_UNAUTHORIZED,
                    null
                );
            }
        } else {
            if (req.body.otp == process.env.OTP.toString()) {
                let token = jwt.sign(
                    {
                        userId: req.body.userId,
                        expiresIn: "20m",
                    },
                    process.env.JWT_SECRET
                );

                let obtainUser = isTrue
                    ? await userModel.findOne({ email: req.body.userId })
                    : await userModel.findOne({ mobile: req.body.userId });
                if (!obtainUser) {
                    res.status(500).send({ message: "User does not Exist" });
                } else {
                    if (isTrue) {
                        obtainUser.isEmail = true;
                    } else {
                        obtainUser.isMobile = true;
                    }
                    obtainUser.otpVerified = true;
                    obtainUser = await obtainUser.save();
                    apiResponse = response.generate1(
                        constants.SUCCESS,
                        obtainUser.adminName,
                        `OTP matched successfully`,
                        constants.HTTP_SUCCESS,
                        { token: token }
                    );
                }
            } else {
                apiResponse = response.generate1(
                    constants.SUCCESS,
                    obtainUser.adminName,
                    `OTP did not matched`,
                    constants.HTTP_UNAUTHORIZED,
                    null
                );
            }
        }
        return res.status(200).send(apiResponse);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
};

let getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let isTrue = regex.test(id);
        let apiResponse;
        let userData;
        if (req.query.isUserId === "true") {
            userData = await userModel.findOne({ _id: id }).select("-__v").lean();
        } else {
            userData = isTrue
                ? await userModel.findOne({ email: id }).lean()
                : await userModel.findOne({ mobile: id }).lean();
        }
        if (!userData) {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.INVALIDUSER,
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(400).send(apiResponse);
            return;
        } else {
            userData.userId = userData.email
                ? userData.email
                : userData.mobile
                    ? userData.mobile
                    : null;
            userData = await buildResponse(userData);
            apiResponse = response.generate(
                constants.SUCCESS,
                messages.USER.FETCHEDSUCCESS,
                constants.HTTP_SUCCESS,
                userData
            );
            res.status(200).send(apiResponse);
            return;
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err.message,
        });
    }
};

let ifscValidation = async (req, res, next) => {
    try {
        let apiResponse;
        const data = await axios({
            url: `https://api.sandbox.co.in/bank/${req.params.code}`,
            method: "GET",
        });
        if (data.data) {
            apiResponse = response.generate(
                constants.SUCCESS,
                "success",
                constants.HTTP_SUCCESS,
                data.data
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.SUCCESS,
                "try after some time",
                constants.HTTP_SUCCESS,
                null
            );
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        if (err.isAxiosError == true && err.response.status == 404) {
            apiResponse = response.generate(
                constants.SUCCESS,
                "send correct IFSC Code",
                constants.HTTP_SUCCESS,
                response.data
            );
            res.status(406).send(apiResponse);
        } else {
            res.status(400).json({
                status: "fails",
                message: err.message,
            });
        }
    }
};

let zipValidation = async (req, res, next) => {
    try {
        let apiResponse;
        const data = await zipCodeModel.findOne({
            Pincode: parseInt(req.params.code),
        });
        if (data) {
            apiResponse = response.generate(
                constants.SUCCESS,
                "success",
                constants.HTTP_SUCCESS,
                data
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.SUCCESS,
                "try after some time",
                constants.HTTP_SUCCESS,
                null
            );
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err.message,
        });
    }
};

let gstValidation = async (req, res, next) => {
    try {
        let apiResponse;
        const data = await axios({
            url: `https://commonapi.mastersindia.co/commonapis/searchgstin?gstin=${req.params.gst}`,
            method: "GET",
            headers: {
                Authorization: "Bearer 0ab31ef7392227173c6e8d34195e86d5eb0da1e9",
                client_id: "JarZChUcsytSBbnkpt",
            },
        });
        if (data) {
            apiResponse = response.generate(
                constants.SUCCESS,
                "success",
                constants.HTTP_SUCCESS,
                data.data.data
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.SUCCESS,
                "try after some time",
                constants.HTTP_SUCCESS,
                null
            );
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err.message,
        });
    }
};

let panValidation = async (req, res, next) => {
    try {
        let apiResponse;
        const data = await axios({
            url: `https://commonapi.mastersindia.co/commonapis/pandetail?pan=${req.params.pan}`,
            method: "GET",
            headers: {
                Authorization: "Bearer 0ab31ef7392227173c6e8d34195e86d5eb0da1e9",
                client_id: "JarZChUcsytSBbnkpt",
            },
        });
        if (data && data.data.data.response.number) {
            apiResponse = response.generate(
                constants.SUCCESS,
                "success",
                constants.HTTP_SUCCESS,
                data.data.data
            );
            res.status(200).send(apiResponse);
        } else {
            apiResponse = response.generate(
                constants.SUCCESS,
                data.data.data.response.message,
                constants.HTTP_SUCCESS,
                null
            );
            res.status(404).send(apiResponse);
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err.message,
        });
    }
};

// let bankAccountValidation = async (req, res, next) => {
//     try {
//         let apiResponse;
//         const data =await axios({
//             url: `https://test-api.sandbox.co.in/bank/${req.body.IFSC}/accounts/${req.body.accountNumber}/penniless-verify`,
//             method: 'GET',
//             headers: {
//                 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJhdWQiOiJBUEkiLCJyZWZyZXNoX3Rva2VuIjoiZXlKaGJHY2lPaUpJVXpVeE1pSjkuZXlKaGRXUWlPaUpCVUVraUxDSnpkV0lpT2lKclpYbGZiR2wyWlY5QlpHVXFLaW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FLaW9xS2lvcUtsVjRjeUlzSW1Gd2FWOXJaWGtpT2lKclpYbGZiR2wyWlY5QlpHVXFLaW9xS2lvcUtpb3FLaW9xS2lvcUtpb3FLaW9xS2lvcUtsVjRjeUlzSW1semN5STZJbUZ3YVM1eGRXbGphMjh1WTI5dElpd2laWGh3SWpveE5Ua3dPVFk1TmpBd0xDSnBiblJsYm5RaU9pSlNSVVpTUlZOSVgxUlBTMFZPSWl3aWFXRjBJam94TlRVNU16UTNNakF3ZlEueHNmYkhQTERFRlRvTy1OUWdaUUpLM25OUjFxdlhvWmhaOHRqS3gzSExydjZiVkJaMHpJZEZ5ai1MUTg1YnJZS0xXQnFnZHlzZ1NDSXlDUXNtV2VOYkEiLCJzdWIiOiJqb2huQGRvZS5jb20iLCJhcGlfa2V5Ijoia2V5X2xpdmVfQWRlKioqKioqKioqKioqKioqKioqKioqKioqKipVeHMiLCJpc3MiOiJhcGkucXVpY2tvLmNvbSIsImV4cCI6MTU5MTA1NjAwMCwiaW50ZW50IjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNTkwOTY5NjAwfQ.nH23CR5RHGQ0U19I_vq3vyJ_85A1a2iEMQij5QHgJQdDuS9x7FmTidsr1CQabSFF5ujE40SFxHv1gJM20TauUw',
//                 // 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJhdWQiOiJBUEkiLCJzdWIiOiJrZXlfbGl2ZV9BZGUqKioqKioqKioqKioqKioqKioqKioqKioqKlV4cyIsImFwaV9rZXkiOiJrZXlfbGl2ZV9BZGUqKioqKioqKioqKioqKioqKioqKioqKioqKlV4cyIsImlzcyI6ImFwaS5xdWlja28uY29tIiwiZXhwIjoxNTkwOTY5NjAwLCJpbnRlbnQiOiJSRUZSRVNIX1RPS0VOIiwiaWF0IjoxNTU5MzQ3MjAwfQ.xsfbHPLDEFToO-NQgZQJK3nNR1qvXoZhZ8tjKx3HLrv6bVBZ0zIdFyj-LQ85brYKLWBqgdysgSCIyCQsmWeNbA',
//                 'x-api-version': '1.0.0',
//                 'x-api-key': 'key_live_Ade**************************Uxs',
//                 'Accept': '*/*',
//                 'Content-Type': 'application/json',
//                 'Accept-Encoding': 'application/json',
//             }
//         });
//         if (data.data) {
//             apiResponse = response.generate(constants.SUCCESS, "success", constants.HTTP_SUCCESS, data.data);
//             res.status(200).send(apiResponse);
//         } else {
//             apiResponse = response.generate(constants.SUCCESS, "try after some time", constants.HTTP_SUCCESS, null);
//             res.status(200).send(apiResponse);
//         }
//     } catch (err) {
//         if (err.isAxiosError == true && err.response.status == 404) {
//             apiResponse = response.generate(constants.SUCCESS, "send correct IFSC Code", constants.HTTP_SUCCESS, response.data);
//             res.status(406).send(apiResponse);
//         } else {
//             res.status(400).json({
//                 status: 'fails',
//                 message: err.message,
//             });
//         }
//     }
// };

let accountActivation = async (req, res, next) => {
    try {
        const id = req.body.userId;
        let apiResponse;
        let isTrue = regex.test(id);
        let userData = isTrue
            ? await userModel.findOne({ email: id })
            : await userModel.findOne({ mobile: id });
        if (!userData) {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.INVALIDUSER,
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(400).send(apiResponse);
            return;
        } else {

            let userListData = await userListModel.findOne({ userId: userData._id });
            if (!userListData) {
                userData.isKYCVerificationInProgress = "PROGRESS";
                userData = await userData.save();
                let createUser = new userListModel({
                    _id: new mongoose.Types.ObjectId(),
                    comapanyName: userData.companyDetails.name,
                    userId: userData._id,
                    registrationDate: userData.createdAt,
                });
                await createUser.save().then();
            }


            apiResponse = response.generate(
                constants.SUCCESS,
                "success",
                constants.HTTP_SUCCESS,
                userData
            );
            res.status(200).send(apiResponse);
            return;
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err.message,
        });
    }
};

let checkEmail = async (req, res, next) => {
    try {
        let apiResponse;
        let isTrue = regex.test(req.body.userId);
        const userData = isTrue
            ? await userModel
                .findOne({ email: req.body.userId })
                .select("-__v -_id")
                .lean()
            : await userModel
                .findOne({ mobile: req.body.userId })
                .select("-__v -_id")
                .lean();
        if (!userData) {
            apiResponse = response.generate(
                constants.SUCCESS,
                isTrue ? "email does not exist" : "mobile does not exist",
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(200).send(apiResponse);
            return;
        } else {
            apiResponse = isTrue
                ? response.generate(
                    constants.ERROR,
                    messages.USER.ALREADYEXISTEMAIL,
                    constants.HTTP_UNAUTHORIZED,
                    null
                )
                : response.generate(
                    constants.ERROR,
                    messages.USER.ALREADYEXISTMOBILE,
                    constants.HTTP_UNAUTHORIZED,
                    null
                );
            res.status(401).send(apiResponse);
            return;
        }
    } catch (err) {
        res.status(400).json({
            status: "fails",
            message: err,
        });
    }
};

let UserUpdateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let apiResponse;
        let isTrue = regex.test(id);
        if (req.body.email) {
            req.body.isEmail = true;
        } else if (req.body.mobile) {
            req.body.isMobile = true;
        }

        const UpdatedUser = isTrue
            ? await userModel.findOneAndUpdate({ email: id }, req.body, { new: true })
            : await userModel.findOneAndUpdate({ mobile: id }, req.body, {
                new: true,
            });
        if (!UpdatedUser) {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.INVALIDUSER,
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(400).send(apiResponse);
            return;
        } else {
            apiResponse = response.generate(
                constants.SUCCESS,
                messages.USER.UPDATEDSUCCESS,
                constants.HTTP_SUCCESS,
                UpdatedUser
            );
            res.status(200).send(apiResponse);
            return;
        }
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};

let DeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        let apiResponse;
        let isTrue = regex.test(id);
        let userData = isTrue
            ? await userModel.findOneAndDelete({ email: id }, { new: true })
            : await userModel.findOneAndDelete({ mobile: id }, { new: true });
        if (!userData) {
            apiResponse = response.generate(
                constants.ERROR,
                messages.USER.INVALIDUSER,
                constants.HTTP_NOT_FOUND,
                null
            );
            res.status(400).send(apiResponse);
            return;
        } else {
            let apiResponse = response.generate(
                constants.SUCCESS,
                messages.USER.DELETEDSUCCESS,
                constants.HTTP_SUCCESS,
                userData
            );
            res.status(200).send(apiResponse);
            return;
        }
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
};

module.exports = {
    registration,
    companyDetails,
    login,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP,
    checkEmail,
    getById,
    UserUpdateById,
    DeleteUser,
    resetPasswordKnownPass,
    personalKYC,
    businessKYC,
    accountActivation,
    ifscValidation,
    // bankAccountValidation,
    zipValidation,
    gstValidation,
    panValidation,
};

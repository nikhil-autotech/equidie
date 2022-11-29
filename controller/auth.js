const mongoose = require("mongoose");
const response = require('../lib/responseLib');
const logger = require('../lib/logger-helper');
const { constants, messages } = require("../constants.js");
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'youraccesstokensecret';
const passwordUtil = require("../utils/password");
const userModel = require('../model/user');
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



let registration = async (req, res) => {
    try {
        // const validRequest =  await authschema.validUser.validateAsync(req.body)
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        const isUserExist = isTrue ? await userModel.findOne({ email: req.body.userId }).lean() : await userModel.findOne({ mobile: req.body.userId }).lean();
        if (!isUserExist) {
            let createUser = isTrue ? new userModel({
                _id: new mongoose.Types.ObjectId(),
                password: req.body.password,
                orgName: req.body.orgName,
                product: req.body.product,
                adminName: req.body.adminName,
                email: req.body.userId

            }) : new userModel({
                _id: new mongoose.Types.ObjectId(),
                password: req.body.password,
                orgName: req.body.orgName,
                product: req.body.product,
                adminName: req.body.adminName,
                mobile: req.body.userId
            });
            await createUser.save().then();
            await sendOTP(req, res)
            let apiResponse = response.generate(constants.SUCCESS, messages.USER.SUCCESS, constants.HTTP_SUCCESS, createUser)
            res.status(200).send(apiResponse)
        }
        else {
            let apiResponse;
            if (!isUserExist.otpVerified) {
                await sendOTP(req, res)
            }
            else {
                apiResponse = response.generate(constants.ERROR, messages.USER.ALREADYEXIST, constants.HTTP_SERVER_ERROR, null)
                res.status(400).send(apiResponse)
            }
        }
    } catch (err) {
        let apiResponse = response.generate(constants.ERROR, messages.USER.FAILURE, constants.HTTP_SERVER_ERROR, err)
        res.status(500).send(apiResponse)
    }
}

let companyDetails = async (req, res) => {
    try {
        // const validRequest =  await authschema.validUser.validateAsync(req.body)
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue ? await userModel.findOne({ email: req.body.userId, isCompanyKYCPartial: false }).lean() : await userModel.findOne({ mobile: req.body.userId, isCompanyKYCPartial: false }).lean();
        if (isUserExist) {
            let data = req.body;
            data["KYCBussiness"] = {};
            if (req.body.companyDetails.PAN.panNumber && req.body.companyDetails.PAN.file) {
                data.KYCBussiness["isPANSubmitted"] = true;
            }
            if (req.body.companyDetails.udhyamDetails) {
                data.KYCBussiness["udhyamDetailsSubmitted"] = true;
            }
            if (req.body.companyDetails.GST) {
                data.KYCBussiness["isGSTSubmitted"] = true;
            }
            if (req.body.companyDetails.bankDetails.bankStatement) {
                data.KYCBussiness["isStatementSubmitted"] = true;
            }
            if (req.body.companyDetails.profitLossStatement) {
                data.KYCBussiness["isProfitLossSubmitted"] = true;
            }
            if (req.body.companyDetails.incomeTaxReturn) {
                data.KYCBussiness["isIncomeTaxSubmitted"] = true;
            }
            if (req.body.companyDetails.currentOutstandingLoan) {
                data.KYCBussiness["isCurrentOutStandingLoan"] = true;
            }
            if (data.KYCBussiness.isPANSubmitted == true && data.KYCBussiness.udhyamDetailsSubmitted == true && data.KYCBussiness.isGSTSubmitted == true && data.KYCBussiness.isStatementSubmitted == true && data.KYCBussiness.isProfitLossSubmitted == true && data.KYCBussiness.isIncomeTaxSubmitted == true && data.KYCBussiness.isCurrentOutStandingLoan == true) {
                data['isDoneCompanyKYC'] = true;
            }
            isUserExist = isTrue ? await userModel.findOneAndUpdate({ email: req.body.userId }, data, { new: true }).lean() : await userModel.findOneAndUpdate({ mobile: req.body.userId }, data, { new: true }).lean();
            let apiResponse = response.generate(constants.SUCCESS, messages.USER.SUCCESS, constants.HTTP_SUCCESS, isUserExist)
            res.status(200).send(apiResponse)
        }
        else {
            apiResponse = response.generate(constants.ERROR, messages.USER.ALREADYKYCDONE, constants.HTTP_UNAUTHORIZED, null)
            res.status(400).send(apiResponse)

        }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(constants.ERROR, messages.USER.FAILURE, constants.HTTP_SERVER_ERROR, err)
        res.status(500).send(apiResponse)
    }
}

let personalKYC = async (req, res) => {
    try {
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue ? await userModel.findOne({ email: req.body.userId, isDoneKYC: false }).lean() : await userModel.findOne({ mobile: req.body.userId, isDoneKYC: false }).lean();
        if (isUserExist) {
        let data = req.body;
        data["KYCPersonal"] = {};
        if ( req.body.PAN.file) {
            data.KYCPersonal["isPANSubmitted"] = true;
        }
        if (req.body.aadhar.file) {
            data.KYCPersonal["isAadharSubmitted"] = true;
        }
        if (data.KYCPersonal["isPANSubmitted"] && data.KYCPersonal["isAadharSubmitted"]) {
            data["isDoneKYC"] = true;
        }
        isUserExist = isTrue ? await userModel.findOneAndUpdate({ email: req.body.userId }, data, { new: true, }).lean() : await userModel.findOneAndUpdate({ mobile: req.body.userId }, data, { new: true }).lean();
        let apiResponse = response.generate(constants.SUCCESS, messages.USER.SUCCESS, constants.HTTP_SUCCESS, isUserExist)
        res.status(200).send(apiResponse)
    }else {
        apiResponse = response.generate(constants.ERROR, messages.USER.ALREADYKYCDONE, constants.HTTP_UNAUTHORIZED, null)
        res.status(400).send(apiResponse)

    }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(constants.ERROR, messages.USER.FAILURE, constants.HTTP_SERVER_ERROR, err)
        res.status(500).send(apiResponse)
    }
}

let businessKYC = async (req, res) => {
    try {
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        let isUserExist = isTrue ? await userModel.findOne({ email: req.body.userId, isDoneCompanyKYC: false }).lean() : await userModel.findOne({ mobile: req.body.userId, isDoneCompanyKYC: false }).lean();
        if (isUserExist) {
            let data = req.body;
        data["KYCBussiness"] = {};
        if (req.body.companyDetails.PAN.panNumber && req.body.companyDetails.PAN.file) {
            data.KYCBussiness["isPANSubmitted"] = true;
        }
        if (req.body.companyDetails.udhyamDetails && req.body.companyDetails.udhyamDetails.file) {
            data.KYCBussiness["udhyamDetailsSubmitted"] = true;
        }
        if (req.body.companyDetails.GST && req.body.companyDetails.GST.file) {
            data.KYCBussiness["isGSTSubmitted"] = true;
        }
        if (req.body.companyDetails.bankDetails.bankStatement && req.body.companyDetails.bankDetails.bankStatement.file) {
            data.KYCBussiness["isStatementSubmitted"] = true;
        }
        if (req.body.companyDetails.profitLossStatement && req.body.companyDetails.profitLossStatement.file) {
            data.KYCBussiness["isProfitLossSubmitted"] = true;
        }
        if (req.body.companyDetails.incomeTaxReturn && req.body.companyDetails.incomeTaxReturn.file) {
            data.KYCBussiness["isIncomeTaxSubmitted"] = true;
        }
        if (req.body.companyDetails.currentOutstandingLoan && req.body.companyDetails.currentOutstandingLoan.file) {
            data.KYCBussiness["isCurrentOutStandingLoan"] = true;
        }
        if (data.KYCBussiness.isPANSubmitted == true && data.KYCBussiness.udhyamDetailsSubmitted == true && data.KYCBussiness.isGSTSubmitted == true && data.KYCBussiness.isStatementSubmitted == true && data.KYCBussiness.isProfitLossSubmitted == true && data.KYCBussiness.isIncomeTaxSubmitted == true && data.KYCBussiness.isCurrentOutStandingLoan == true) {
            data['isDoneCompanyKYC'] = true;
        }
            isUserExist = isTrue ? await userModel.findOneAndUpdate({ email: req.body.userId }, data, { new: true, }).lean() : await userModel.findOneAndUpdate({ mobile: req.body.userId }, data, { new: true }).lean();
            let apiResponse = response.generate(constants.SUCCESS, messages.USER.SUCCESS, constants.HTTP_SUCCESS, isUserExist)
            res.status(200).send(apiResponse)
        }
        else {
            apiResponse = response.generate(constants.ERROR, messages.USER.ALREADYKYCDONE, constants.HTTP_UNAUTHORIZED, null)
            res.status(400).send(apiResponse)

        }
    } catch (err) {
        console.log(err);
        let apiResponse = response.generate(constants.ERROR, messages.USER.FAILURE, constants.HTTP_SERVER_ERROR, err)
        res.status(500).send(apiResponse)
    }
}

let login = async (req, res) => {
    try {
        const { password } = req.body;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        const getUser = isTrue ? await userModel.findOne({ email: req.body.userId })
            .select(
                '-createdAt -orgName -updatedAt -product -__v'
            ) : await userModel.findOne({ mobile: req.body.userId })
                .select(
                    '-createdAt -orgName -updatedAt -product -__v'
                );
        if (getUser.otpVerified) {
            const resData = {};
            if (getUser && getUser.password && (await getUser.comparePassword(password))) {
                console.log(getUser);
                resData.token = passwordUtil.genJwtToken(getUser._id);
                resData.user = JSON.parse(JSON.stringify(getUser));
                resData.user.userId = req.body.userId;
            } else {
                let apiResponse = response.generate(constants.ERROR, messages.LOGIN.FAILURE, constants.HTTP_UNAUTHORIZED,)
                res.status(400).send(apiResponse)
                return
            }
            let apiResponse = isTrue ? response.generate(constants.SUCCESS, `Welcome ${resData.user.email}!`/*messages.LOGIN.SUCCESS*/, constants.HTTP_SUCCESS, resData) : response.generate(constants.SUCCESS, `Welcome ${resData.user.mobile}!`/*messages.LOGIN.SUCCESS*/, constants.HTTP_SUCCESS, resData);
            res.status(200).send(apiResponse)
            return
        }
        else {
            let apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse)
        }
    }
    catch (err) {
        let apiResponse = response.generate(constants.ERROR, messages.LOGIN.FAILURE, constants.HTTP_SERVER_ERROR, err)
        res.status(500).send(apiResponse)
        return
    }
}

const sendMessage = async (email, token) => {
    try {
        const msg = {
            to: email, // Change to your recipient
            from: 'kyalharshit@gmail.com', // Change to your verified sender
            subject: 'OTP Form EQUIDEI',
            text: `your OTP is ${process.env.OTP}`,
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
    catch (err) {
        console.log("sorry for delay");
    }

}

let forgotPassword = async (req, res) => {
    try {
        let userId = req.body.userId
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        if (isTrue) {
            let obtainUser = isTrue ? await userModel.findOne({ email: userId }) : await userModel.findOne({ mobile: userId });
            if (obtainUser) {
                let token = jwt.sign(
                    {
                        id: obtainUser._id,
                        userId: isTrue ? obtainUser.email : obtainUser.mobile,
                        expiresIn: "20m",
                    }, process.env.JWT_SECRET)

                sendMessage(obtainUser.userId, token);
                return res.status(200).send({ status: true, msg: "check your mail" })
            }
            else {
                return res.status(404).send({ status: true, msg: "User not found" })
            }
        }
        else {
            return res.status(200).send({ status: true, msg: "UserId is not E-mail" })
        }
    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let resetPasswordKnownPass = async (req, res) => {
    try {
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        let obtainUser = isTrue ? await userModel.findOne({ email: req.body.userId }) : await userModel.findOne({ mobile: req.body.userId });
        if (obtainUser) {
            if (obtainUser && obtainUser.password && (await obtainUser.comparePassword(req.body.password))) {
                obtainUser.password = req.body.newPassword;
                obtainUser = await obtainUser.save();
                let apiResponse = response.generate(constants.SUCCESS, `your password is successfully reset`, constants.HTTP_SUCCESS, obtainUser)
                return res.status(200).send(apiResponse)
            } else {
                let apiResponse = response.generate(constants.ERROR, messages.USER.DOESNOTMATCH, constants.HTTP_UNAUTHORIZED,)
                res.status(400).send(apiResponse)
                return
            }
        }
        else {
            return res.status(404).send({ status: true, msg: "User not found" })
        }

    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let resetPassword = async (req, res, next) => {
    try {
        let newPassword = req.body.newPassword;

        const bearerHeader = req.headers['authorization'];
        if (!bearerHeader) {
            let apiResponse = response.generate(constants.SUCCESS, `Not Authorized`, constants.HTTP_UNAUTHORIZED, null)
            return res.status(401).send(apiResponse)
        }
        const bearer = bearerHeader.split(' ')
        req.token = bearer[1]
        let userData = jwt.verify(req.token, process.env.JWT_SECRET);
        console.log(userData)
        let obtainUser;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(userData.userId);
        obtainUser = isTrue ? await userModel.findOne({ email: userData.userId }) : await userModel.findOne({ mobile: userData.userId });
        if (!obtainUser) {
            let apiResponse = response.generate(constants.SUCCESS, `user not found for this user ${userData.userId}`, constants.HTTP_NOT_FOUND, null)
            return res.status(404).send(apiResponse)
        }
        obtainUser.password = newPassword;
        obtainUser = await obtainUser.save();
        let apiResponse = response.generate(constants.SUCCESS, `your password is successfully reset`, constants.HTTP_SUCCESS, obtainUser)
        return res.status(200).send(apiResponse)
    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let sendOTP = async (req, res, next) => {
    try {
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        let apiResponse;
        let obtainUser = isTrue ? await userModel.findOne({ email: req.body.userId }).select(
            '-createdAt -orgName -updatedAt -product -__v'
        ).lean() : await userModel.findOne({ mobile: req.body.userId }).select(
            '-createdAt -orgName -updatedAt -product -__v'
        ).lean();
        if (!req.body.changed) {
            if (!obtainUser) {
                res.status(500).send({ message: 'This userId is not registered' })
            }
        }

        if (!isTrue) {
            apiResponse = response.generate1(constants.SUCCESS, obtainUser ? obtainUser.adminName : null, `your OTP is sent to this mobile ${req.body.userId}`, constants.HTTP_SUCCESS, obtainUser)
        }
        else {
            const msg = {
                to: req.body.userId, // Change to your recipient
                from: 'kyalharshit@gmail.com', // Change to your verified sender
                subject: 'OTP Form EQUIDEI',
                text: `your OTP is ${process.env.OTP}`,
            }
            await sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                    apiResponse = response.generate1(constants.SUCCESS, obtainUser ? obtainUser.adminName : null, `your OTP sent to this ${req.body.userId} mail Successfully`, constants.HTTP_SUCCESS, null);
                })
                .catch((error) => {
                    console.error(error)
                })
        }
        return res.status(200).send(apiResponse)
    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let verifyOTP = async (req, res, next) => {
    try {
        let apiResponse;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        if (req.body.changed) {
            isTrue = regex.test(req.body.oldUserId);
            if (req.body.otp == process.env.OTP.toString()) {
                let obtainUser = isTrue ? await userModel.findOne({ email: req.body.oldUserId }) : await userModel.findOne({ mobile: req.body.oldUserId });
                if (!obtainUser) {
                    res.status(500).send({ message: 'oldUserId does not Exist' })
                }
                else {
                    if (isTrue) {
                        obtainUser.isEmail = true;
                    } else {
                        obtainUser.isMobile = true;
                    }
                    obtainUser = await obtainUser.save();
                    apiResponse = response.generate1(constants.SUCCESS, obtainUser.adminName, `OTP matched successfully`, constants.HTTP_SUCCESS, null);
                }
            }
            else {
                apiResponse = response.generate1(constants.SUCCESS, obtainUser.adminName, `OTP did not matched`, constants.HTTP_UNAUTHORIZED, null)
            }
        }
        else {
            if (req.body.otp == process.env.OTP.toString()) {
                let token = jwt.sign(
                    {
                        userId: req.body.userId,
                        expiresIn: "20m",
                    }, process.env.JWT_SECRET)

                let obtainUser = isTrue ? await userModel.findOne({ email: req.body.userId }) : await userModel.findOne({ mobile: req.body.userId });
                if (!obtainUser) {
                    res.status(500).send({ message: 'User does not Exist' })
                }
                else {
                    obtainUser.otpVerified = true;
                    obtainUser = await obtainUser.save();
                    apiResponse = response.generate1(constants.SUCCESS, obtainUser.adminName, `OTP matched successfully`, constants.HTTP_SUCCESS, { token: token });
                }
            }
            else {
                apiResponse = response.generate1(constants.SUCCESS, obtainUser.adminName, `OTP did not matched`, constants.HTTP_UNAUTHORIZED, null)
            }
        }
        return res.status(200).send(apiResponse)

    } catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

let getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let apiResponse;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(id);
        const userData = isTrue ? await userModel.findOne({ email: id }).select('-__v -_id').lean() : await userModel.findOne({ mobile: id }).select('-__v -_id').lean();
        if (!userData) {
            apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse);
            return
        }
        else {
            userData.userId = userData.email ? userData.email : userData.mobile ? userData.mobile : null;
            apiResponse = response.generate(constants.SUCCESS, messages.USER.FETCHEDSUCCESS, constants.HTTP_SUCCESS, userData);
            res.status(200).send(apiResponse);
            return
        }
    } catch (err) {
        res.status(400).json({
            status: 'fails',
            message: err,
        });
    }
};

let checkEmail = async (req, res, next) => {
    try {

        let apiResponse;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(req.body.userId);
        const userData = isTrue ? await userModel.findOne({ email: req.body.userId }).select('-__v -_id').lean() : await userModel.findOne({ mobile: req.body.userId }).select('-__v -_id').lean();
        if (!userData) {
            apiResponse = response.generate(constants.SUCCESS, isTrue ? 'email does not exist' : 'mobile does not exist', constants.HTTP_NOT_FOUND, null);
            res.status(200).send(apiResponse);
            return
        }
        else {
            apiResponse = isTrue ? response.generate(constants.ERROR, messages.USER.ALREADYEXISTEMAIL, constants.HTTP_UNAUTHORIZED, null) : response.generate(constants.ERROR, messages.USER.ALREADYEXISTMOBILE, constants.HTTP_UNAUTHORIZED, null);
            res.status(401).send(apiResponse);
            return
        }
    } catch (err) {
        res.status(400).json({
            status: 'fails',
            message: err,
        });
    }
};

let UserUpdateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let apiResponse;
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(id);
        if (req.body.email) {
            req.body.isEmail = true;
        } else if (req.body.mobile) {
            req.body.isMobile = true;
        }

        const UpdatedUser = isTrue ? await userModel.findOneAndUpdate(
            { email: id },
            req.body,
            { new: true }
        ) : await userModel.findOneAndUpdate(
            { mobile: id },
            req.body,
            { new: true }
        );
        if (!UpdatedUser) {
            apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse);
            return
        }
        else {
            apiResponse = response.generate(constants.SUCCESS, messages.USER.UPDATEDSUCCESS, constants.HTTP_SUCCESS, UpdatedUser);
            res.status(200).send(apiResponse);
            return
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
        const regex = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/);
        let isTrue = regex.test(id);
        let userData = isTrue ? await userModel.findOneAndDelete({ email: id }, { new: true }) : await userModel.findOneAndDelete({ mobile: id }, { new: true });
        if (!userData) {
            apiResponse = response.generate(constants.ERROR, messages.USER.INVALIDUSER, constants.HTTP_NOT_FOUND, null)
            res.status(400).send(apiResponse);
            return
        }
        else {
            let apiResponse = response.generate(constants.SUCCESS, messages.USER.DELETEDSUCCESS, constants.HTTP_SUCCESS, userData);
            res.status(200).send(apiResponse);
            return
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
    businessKYC
}
const express = require("express")
const authController = require("../controller/auth");
const router = express.Router()

router.post('/signup', authController.registration);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-known-password', authController.resetPasswordKnownPass);
router.post('/sendOTP', authController.sendOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/checkEmail', authController.checkEmail);
router.post('/companyDetails', authController.companyDetails);
router.post('/personalKYC', authController.personalKYC);
router.post('/businessKYC', authController.businessKYC);
router.post('/accountActivation', authController.accountActivation);
router
	.route('/:id')
	.get(authController.getById)
	.put(authController.UserUpdateById)
	.delete(authController.DeleteUser);

module.exports = router;

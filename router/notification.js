const express = require("express")
const notificationController = require("../controller/notification");
const router = express.Router()

router.get('/getAll', notificationController.getAll);

module.exports = router;
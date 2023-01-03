const express = require("express")
const notificationController = require("../controller/notification");
const router = express.Router()

router.get('/getAll', notificationController.getAll);

router.route('/:id').delete(notificationController.deleteNotification);

module.exports = router;
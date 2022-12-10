const express = require("express")
const userListController = require("../controller/userList");
const router = express.Router()

router.get('/getAll', userListController.GetAll);
// router.post('/login', userListController.login);

// router
// 	.route('/:id')
// 	.get(userListController.getById)

module.exports = router;

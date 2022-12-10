const express = require("express")
const userListController = require("../controller/userList");
const router = express.Router()

router.get('/getAll', userListController.getAll);
router.post('/filter', userListController.filterData);
router.post('/userByid', userListController.getUserById);

// router
// 	.route('/:id')
// 	.get(userListController.getById)

module.exports = router;

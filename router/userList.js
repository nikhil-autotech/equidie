const express = require("express")
const userListController = require("../controller/userList");
const router = express.Router()

router.get('/getAll', userListController.getAll);
router.post('/filter', userListController.filterData);

// router
// 	.route('/:id')
// 	.get(userListController.getById)

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST")

router.route("/")
.get(userController.fetchUsers)
.post(verifyPermission(PERMISSIONS_LIST.CREATE_USER), userController.createUser)
.put(userController.editUser);

module.exports = router;

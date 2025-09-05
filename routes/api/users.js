const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const permissionIdFinder = require("../../utils/permissionIdFinder");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST")

router.route("/")
.get(userController.fetchUsers)
.post(verifyPermission("7e1c02e0-ca19-4b08-aabe-f6845951a37d"), userController.createUser)
.put(userController.editUser);

module.exports = router;

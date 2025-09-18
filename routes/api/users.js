const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST")

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_USERS), userController.getAllUsers)
.post(verifyPermission(PERMISSIONS_LIST.CREATE_USER), userController.createUser)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_DETAILS),userController.editUser);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_USER),userController.deleteUser)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_USERS),userController.getUser);

router.route("/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_PASSWORD),userController.editUserPassword);

module.exports = router;

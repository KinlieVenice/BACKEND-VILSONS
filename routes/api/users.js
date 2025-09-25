const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST")

router.route("/me")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), userController.editProfile)

router.route("/:id/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_PASSWORD),userController.editUserPassword);

router.route("/me/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD),userController.editProfilePassword);

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_USERS), userController.getAllUsers)
.post(verifyPermission(PERMISSIONS_LIST.CREATE_USER), userController.createUser);

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_SINGLE_USER),userController.getUser)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_DETAILS),userController.editUser)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_USER),userController.deleteUser);


module.exports = router;

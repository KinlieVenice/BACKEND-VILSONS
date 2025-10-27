const express = require("express");
const router = express.Router();
const userController = require("../../../controllers/admin/maintabs/userController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");
const createUploader = require("../../../middleware/imageHandler");
const uploadImage = createUploader();

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_USERS), userController.getAllUsers)
.post(verifyPermission(PERMISSIONS_LIST.CREATE_USER), uploadImage, userController.createUser);

router.route("/:id/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_PASSWORD),userController.editUserPassword);

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_USERS),userController.getUser)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_USER_DETAILS), uploadImage, userController.editUser)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_USER),userController.deleteUser);


module.exports = router;

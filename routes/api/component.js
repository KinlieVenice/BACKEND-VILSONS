const express = require("express");
const router = express.Router();
const componentController = require("../../controllers/componentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), componentController.createComponent);

module.exports = router;

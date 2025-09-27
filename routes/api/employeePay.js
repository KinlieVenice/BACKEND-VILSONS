const express = require("express");
const router = express.Router();
const employeePayController = require("../../controllers/employeePayController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), employeePayController.createEmployeePay);

module.exports = router;

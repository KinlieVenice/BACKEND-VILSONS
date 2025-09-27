const express = require("express");
const router = express.Router();
const employeePayController = require("../../controllers/employeePayController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), employeePayController.createEmployeePay)
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), employeePayController.getAllEmployeePays)

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), employeePayController.editEmployeePay)
.delete(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), employeePayController.deleteEmployeePay);

module.exports = router;

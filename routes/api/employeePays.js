const express = require("express");
const router = express.Router();
const employeePayController = require("../../controllers/admin/employeePayController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR), employeePayController.createEmployeePay)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_LABORS), employeePayController.getAllEmployeePays)

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_LABOR), employeePayController.editEmployeePay)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_LABORS), employeePayController.getEmployeePay)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_LABOR), employeePayController.deleteEmployeePay);

module.exports = router;

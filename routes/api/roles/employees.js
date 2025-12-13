const express = require("express");
const router = express.Router();
const employeeController = require("../../../controllers/admin/roles/employeeController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR || PERMISSIONS_LIST.EDIT_LABOR), employeeController.getAllEmployees)

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR || PERMISSIONS_LIST.EDIT_LABOR || PERMISSIONS_LIST.VIEW_LABORS || PERMISSIONS_LIST.VIEW_EMPLOYEE_DETAILS), employeeController.getEmployee)

module.exports = router
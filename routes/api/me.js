const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const userController = require("../../controllers/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");


//FIX ALL PERM HERE

router.route("/")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), userController.editProfile)
.get(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), userController.getMyProfile)

router.route("/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD),userController.editProfilePassword);

router.route("/job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), jobOrderController.getAllMyJobOrders);

router.route("/job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getMyJobOrder);

router.route("/job-orders/assigned")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), jobOrderController.getAllAssignedJobOrders);

router.route("/job-orders/assigned/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAssignedJobOrder);

module.exports = router;

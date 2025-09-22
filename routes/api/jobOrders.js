const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), jobOrderController.createJobOrder)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER), jobOrderController.editJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);


router.route("/assignedorders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), jobOrderController.getAssignedJobOrders);

router.route("/myorders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), jobOrderController.getMyJobOrders);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_JOB_ORDER), jobOrderController.deleteJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER), jobOrderController.getJobOrder);


module.exports = router;
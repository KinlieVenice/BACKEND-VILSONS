const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");


router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), jobOrderController.createJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/assignedorders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), jobOrderController.getAssignedJobOrders);


router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_JOB_ORDER), jobOrderController.deleteJobOrder)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER), jobOrderController.editJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER), jobOrderController.getJobOrder);

router.route("/:id/status/:accept")
.patch(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), jobOrderController.acceptJobOrder)


module.exports = router;
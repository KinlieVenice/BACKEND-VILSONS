const express = require("express");
const router = express.Router();
const jobOrderController = require("../../../controllers/admin/maintabs/jobOrderController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");


router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), jobOrderController.createJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/group/:statusGroup")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_JOB_ORDER), jobOrderController.deleteJobOrder)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER), jobOrderController.editJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getJobOrder);

router.route("/:id/status")
.patch(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER_STATUS), jobOrderController.editJobOrderStatus)

//PERM EDIT
router.route("/:id/contractor/:accept")


module.exports = router;
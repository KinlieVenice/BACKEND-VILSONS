const express = require("express");
const router = express.Router();
const jobOrderController = require("../../../controllers/admin/maintabs/jobOrderController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");
const createUploader = require("../../../middleware/imageHandler");
const uploadImages = createUploader(true);


router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), uploadImages, jobOrderController.createJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/group/:statusGroup")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/unpaid")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDERS), jobOrderController.getAllJobOrders);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_JOB_ORDER), jobOrderController.deleteJobOrder)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER), uploadImages, jobOrderController.editJobOrder)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_JOB_ORDER_DETAILS), jobOrderController.getJobOrder);

router.route("/:id/status")
.put(verifyPermission(PERMISSIONS_LIST.CHANGE_JOB_ORDER_STATUS), jobOrderController.editJobOrderStatus)

router.route("/accept/:id")
.put(verifyPermission(PERMISSIONS_LIST.HANDLE_COMPLETED_JOB_ORDERS), jobOrderController.acceptJobOrderCompleted) //change permission

router.route("/reject/:id")
.put(verifyPermission(PERMISSIONS_LIST.HANDLE_COMPLETED_JOB_ORDERS), jobOrderController.rejectJobOrderCompleted) //change permission

router.route("/released/:id")
.put(verifyPermission(PERMISSIONS_LIST.HANDLE_COMPLETED_JOB_ORDERS), jobOrderController.acceptJobOrderForRelease) //change permission

router.route("/completed/:id")
.put(verifyPermission(PERMISSIONS_LIST.HANDLE_COMPLETED_JOB_ORDERS), jobOrderController.markJobOrderCompleted) //change permission

module.exports = router;
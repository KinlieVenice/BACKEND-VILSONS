const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), jobOrderController.getMyJobOrders);

module.exports = router;

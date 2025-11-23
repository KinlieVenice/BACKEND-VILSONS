const express = require("express");
const router = express.Router();
const approvalLogController = require("../../../controllers/admin/maintabs/approvalLogController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_APPROVAL_LOGS), approvalLogController.getAllApprovalLogs);

router.route("/approve/:id")
.put(verifyPermission(PERMISSIONS_LIST.ACCEPT_APPROVAL_LOGS), approvalLogController.approveApprovalLog);

router.route("/reject/:id")
.put(verifyPermission(PERMISSIONS_LIST.ACCEPT_APPROVAL_LOGS), approvalLogController.rejectApprovalLog);

module.exports = router
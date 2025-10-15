const express = require("express");
const router = express.Router();
const approvalLogController = require("../../controllers/admin/approvalLogController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), approvalLogController.getAllApprovalLogs);

router.route("/approve/:id")
.put(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), approvalLogController.approveApprovalLog);

router.route("/reject/:id")
.put(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), approvalLogController.rejectApprovalLog);

module.exports = router
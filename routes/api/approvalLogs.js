const express = require("express");
const router = express.Router();
const approvalLogController = require("../../controllers/approvalLogController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), approvalLogController.getAllApprovalLogs);

module.exports = router
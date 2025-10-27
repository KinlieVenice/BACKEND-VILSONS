const express = require("express");
const router = express.Router();
const activityLogController = require("../../../controllers/admin/maintabs/activityLogController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ACTIVITY_LOGS), activityLogController);

module.exports = router
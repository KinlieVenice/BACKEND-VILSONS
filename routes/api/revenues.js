const express = require("express");
const router = express.Router();
const revenueController = require("../../controllers/revenueController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_OTHER_INCOME), revenueController.getRevenue);

module.exports = router
const express = require("express");
const router = express.Router();
const financeController = require("../../controllers/admin/financeController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_REVENUE_PROFIT), financeController.getRevenueProfit);

module.exports = router
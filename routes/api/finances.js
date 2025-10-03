const express = require("express");
const router = express.Router();
const financeController = require("../../controllers/financeController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_OTHER_INCOME), financeController.getRevenueProfit);

module.exports = router
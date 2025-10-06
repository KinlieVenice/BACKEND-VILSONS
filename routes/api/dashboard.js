const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/revenue")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), dashboardController.getRevenue);

router.route("/profit")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), dashboardController.getProfit); 

router.route("/expenses")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), dashboardController.getExpenses);

module.exports = router;
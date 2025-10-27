const express = require("express");
const router = express.Router();
const dashboardController = require("../../../controllers/admin/maintabs/dashboardController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/revenue")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_DASHBOARD_REVENUE), dashboardController.getRevenue);

router.route("/profit")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_DASHBOARD_PROFIT), dashboardController.getProfit); 

router.route("/expenses")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_DASHBOARD_EXPENSES), dashboardController.getExpenses);

router.route("/customer-balance")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_DASHBOARD_CUSTOMER_BALANCE), dashboardController.getCustomerBalance);

// GET /api/dashboard/revenue-profit-chart?type=monthly&year=2025
// GET /api/dashboard/revenue-profit-chart?type=yearly

router.route("/revenue-profit-chart")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_DASHBOARD_PROFIT), dashboardController.getRevenueAndProfitChart);

module.exports = router;
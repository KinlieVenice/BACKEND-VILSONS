const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/admin/customerController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMERS), customerController.getAllCustomers)

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMERS), customerController.getCustomer)

module.exports = router
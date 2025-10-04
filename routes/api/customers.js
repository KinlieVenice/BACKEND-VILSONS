const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), customerController.getCustomer)

module.exports = router
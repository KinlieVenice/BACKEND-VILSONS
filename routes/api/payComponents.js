const express = require("express");
const router = express.Router();
const payComponentController = require("../../controllers/admin/payComponentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR), payComponentController.getPayComponents);

module.exports = router;

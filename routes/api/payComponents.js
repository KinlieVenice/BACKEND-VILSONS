const express = require("express");
const router = express.Router();
const payComponentController = require("../../controllers/admin/payComponentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR), payComponentController.getAllComponents);
router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR), payComponentController.getPayComponent);

module.exports = router;

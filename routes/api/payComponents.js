const express = require("express");
const router = express.Router();
const payComponentController = require("../../controllers/admin/payComponentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR || PERMISSIONS_LIST.EDIT_LABOR), payComponentController.getAllComponents);
router.route("/:id")
.get(payComponentController.getPayComponent);

module.exports = router;

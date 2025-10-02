const express = require("express");
const router = express.Router();
const payComponentController = require("../../controllers/payComponentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_OVERHEAD), payComponentController.getPayComponents);

module.exports = router;

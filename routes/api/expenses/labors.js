const express = require("express");
const router = express.Router();
const laborController = require("../../../controllers/admin/expenses/laborController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_LABORS), laborController.getAllLaborPays);

module.exports = router;
const express = require("express");
const router = express.Router();
const laborController = require("../../controllers/laborController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), laborController.getAllLaborPays);

module.exports = router;
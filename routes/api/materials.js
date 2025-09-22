const express = require("express");
const router = express.Router();
const materialController = require("../../controllers/materialController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MATERIALS), materialController.getAllMaterials);

module.exports = router;

const express = require("express");
const router = express.Router();
const contractorController = require("../../controllers/contractorController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), contractorController.getContractor)

module.exports = router
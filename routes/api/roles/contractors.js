const express = require("express");
const router = express.Router();
const contractorController = require("../../../controllers/admin/roles/contractorController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), contractorController.getAllContractors)

router.route("/:id")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), contractorController.getContractor)

module.exports = router
const express = require("express");
const router = express.Router();
const contractorPayController = require("../../../controllers/admin/expenses/contractorPayController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_LABOR), contractorPayController.createContractorPay)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_LABORS), contractorPayController.getAllContractorPays)

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_LABOR), contractorPayController.editContractorPay)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_LABORS), contractorPayController.getContractorPay)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_LABOR), contractorPayController.deleteContractorPay)

module.exports = router;
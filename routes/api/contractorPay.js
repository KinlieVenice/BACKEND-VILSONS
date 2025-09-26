const express = require("express");
const router = express.Router();
const contractorPayController = require("../../controllers/contractorPayController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

//PERM FIX
router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), contractorPayController.createContractorPay)
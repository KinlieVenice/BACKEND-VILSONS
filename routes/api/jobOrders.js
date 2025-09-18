const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), jobOrderController.createJobOrder);

module.exports = router;
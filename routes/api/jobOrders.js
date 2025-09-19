const express = require("express");
const router = express.Router();
const jobOrderController = require("../../controllers/jobOrderController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER), jobOrderController.createJobOrder)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_JOB_ORDER), jobOrderController.editJobOrder);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_JOB_ORDER), jobOrderController.deleteJobOrder)

module.exports = router;
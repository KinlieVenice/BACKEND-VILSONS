const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/branchController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), branchController.createBranch)
.put(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), branchController.editBranch);

module.exports = router;

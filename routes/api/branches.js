const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/branchController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_BRANCH), branchController.createBranch)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_BRANCH), branchController.getAllBranches);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_BRANCH), branchController.deleteBranch)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_BRANCH), branchController.editBranch)

.get(verifyPermission(PERMISSIONS_LIST.VIEW_BRANCH), branchController.getBranch);

module.exports = router;

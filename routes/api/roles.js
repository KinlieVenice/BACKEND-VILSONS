const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/admin/roleController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(roleController.createRole)
.get(roleController.getAllRoles)

router.route("/:roleId")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_ROLES_PERMISSIONS), roleController.editRolePermissions)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ROLES_PERMISSIONS),roleController.getRolePermissions)

module.exports = router;

const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/admin/roleController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
  .post(verifyPermission(PERMISSIONS_LIST.CREATE_ROLE_PERMISSION), roleController.createRole)
  .get(verifyPermission(PERMISSIONS_LIST.VIEW_ROLE_PERMISSIONS), roleController.getAllRoles);

// fix permissions
router.route("/:roleId")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_ROLE_PERMISSION), roleController.editRolePermissions)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_ROLE_PERMISSION), roleController.deleteRole)

router.route("/permissions/:roleId")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ROLE_PERMISSIONS),roleController.getRolePermissions)

module.exports = router;

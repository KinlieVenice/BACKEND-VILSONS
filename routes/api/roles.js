const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/roleController");

router.route("/")
.post(roleController.createRole)

router.route("/:roleId")
.put(roleController.editRolePermission)
.get(roleController.getRolePermission)

module.exports = router;

const express = require("express");
const router = express.Router();
const permissionController = require("../../controllers/admin/permissionController");

router.post("/", permissionController.createPermission);

module.exports = router;

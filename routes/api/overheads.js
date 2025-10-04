const express = require("express");
const router = express.Router();
const overheadController = require("../../controllers/overheadController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_OVERHEAD), overheadController.createOverhead)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_OVERHEAD), overheadController.getAllOverheads)



router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_OVERHEAD), overheadController.deleteOverhead)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_OVERHEAD), overheadController.editOverhead)

module.exports = router;
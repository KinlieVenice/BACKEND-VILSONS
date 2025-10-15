const express = require("express");
const router = express.Router();
const equipmentController = require("../../controllers/admin/equipmentController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), equipmentController.createEquipment)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_EQUIPMENTS), equipmentController.getAllEquipments);

router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_EQUIPMENT), equipmentController.deleteEquipment)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_EQUIPMENT), equipmentController.editEquipment)
// .get(verifyPermission(PERMISSIONS_LIST.VIEW_EQUIPMENT), equipmentController.getEquipment)

module.exports = router;

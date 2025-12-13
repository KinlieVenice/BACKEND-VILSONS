const express = require("express");
const router = express.Router();
const truckController = require("../../../controllers/admin/maintabs/truckController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");
const createUploader = require("../../../middleware/imageHandler");
const uploadImage = createUploader();

router.route("/")
  .post(verifyPermission(PERMISSIONS_LIST.CREATE_TRUCK), uploadImage, truckController.createTruck)
  .get(verifyPermission(PERMISSIONS_LIST.VIEW_TRUCKS),truckController.getAllTrucks);

router.route("/ownership")
  .put(verifyPermission(PERMISSIONS_LIST.CHANGE_TRUCK_OWNER),truckController.editTruckOwner)

router.route("/:id")
  .delete(verifyPermission(PERMISSIONS_LIST.DELETE_TRUCK),truckController.deleteTruck)
  .put(verifyPermission(PERMISSIONS_LIST.EDIT_TRUCK), uploadImage, truckController.editTruck)
  .get(verifyPermission(PERMISSIONS_LIST.VIEW_TRUCK_DETAILS),truckController.getTruck);


module.exports = router;
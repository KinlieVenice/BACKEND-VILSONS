const express = require("express");
const router = express.Router();
const truckController = require("../../controllers/truckController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
  .post(verifyPermission(PERMISSIONS_LIST.CREATE_TRUCKS),truckController.createTruck)
  .get(verifyPermission(PERMISSIONS_LIST.VIEW_TRUCKS),truckController.getAllTrucks);

router.route("/ownership")
  .put(verifyPermission(PERMISSIONS_LIST.EDIT_TRUCK_OWNER),truckController.editTruckOwner)

router.route("/:id")
  .delete(verifyPermission(PERMISSIONS_LIST.DELETE_TRUCKS),truckController.deleteTruck)
  .put(verifyPermission(PERMISSIONS_LIST.EDIT_TRUCKS),truckController.editTruck)
  .get(verifyPermission(PERMISSIONS_LIST.VIEW_SINGLE_TRUCK),truckController.getTruck);


module.exports = router;
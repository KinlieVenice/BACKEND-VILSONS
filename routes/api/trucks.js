const express = require("express");
const router = express.Router();
const truckController = require("../../controllers/truckController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
  .post(verifyPermission(PERMISSIONS_LIST.CREATE_TRUCKS),truckController.createTruck)
  .put(verifyPermission(PERMISSIONS_LIST.EDIT_TRUCKS),truckController.editTruck);


module.exports = router;
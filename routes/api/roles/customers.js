const express = require("express");
const router = express.Router();
const customerController = require("../../../controllers/admin/roles/customerController");
const verifyPermission = require("../../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../../constants/PERMISSIONS_LIST");

router.route("/")
.get(verifyPermission(PERMISSIONS_LIST.CREATE_JOB_ORDER || PERMISSIONS_LIST.EDIT_JOB_ORDER), customerController.getAllCustomers)

router
  .route("/:id")
  .get(
    verifyPermission(
      PERMISSIONS_LIST.CREATE_JOB_ORDER ||
        PERMISSIONS_LIST.EDIT_JOB_ORDER ||
        PERMISSIONS_LIST.VIEW_JOB_ORDERS ||
        PERMISSIONS_LIST.VIEW_CUSTOMER_DETAILS
    ),
    customerController.getCustomer
  );

module.exports = router
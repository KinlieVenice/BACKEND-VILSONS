const express = require("express");
const router = express.Router();
const onlineTransactionController = require("../../controllers/admin/onlineTransactionController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_TRANSACTION), onlineTransactionController.createCheckoutSession);

module.exports = router;

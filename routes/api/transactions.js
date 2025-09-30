const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transactionController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.createTransaction);

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.editTransaction)
.delete(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.deleteTransaction)

module.exports = router;
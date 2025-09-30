const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/transactionController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.createTransaction)
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.getAllTransactions)

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.editTransaction)
.delete(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.deleteTransaction)
.get(verifyPermission(PERMISSIONS_LIST.CREATE_EQUIPMENT), transactionController.getTransaction)

module.exports = router;
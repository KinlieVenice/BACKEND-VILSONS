const express = require("express");
const router = express.Router();
const transactionController = require("../../controllers/admin/transactionController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_TRANSACTION), transactionController.createTransaction)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_TRANSACTIONS), transactionController.getAllTransactions)

router.route("/:id")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_TRANSACTION), transactionController.editTransaction)
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_TRANSACTION), transactionController.deleteTransaction)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_TRANSACTIONS), transactionController.getTransaction)

module.exports = router;
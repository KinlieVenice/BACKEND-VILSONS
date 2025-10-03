const express = require("express");
const router = express.Router();
const otherIncomeController = require("../../controllers/otherIncomeController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");

router.route("/")
.post(verifyPermission(PERMISSIONS_LIST.CREATE_OTHER_INCOME), otherIncomeController.createOtherIncome)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_OTHER_INCOMES), otherIncomeController.getAllOtherIncomes)


router.route("/:id")
.delete(verifyPermission(PERMISSIONS_LIST.DELETE_OTHER_INCOME), otherIncomeController.deleteOtherIncome)
.put(verifyPermission(PERMISSIONS_LIST.EDIT_OTHER_INCOME), otherIncomeController.editOtherIncome)

module.exports = router;
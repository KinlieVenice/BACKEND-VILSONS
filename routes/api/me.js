const express = require("express");
const router = express.Router();
const assignedJobOrderController = require("../../controllers/contractor/assignedJobOrderController");
const myJobOrderController = require("../../controllers/customer/myJobOrderController");
const financeController = require("../../controllers/contractor/financeController");
const transactionController = require("../../controllers/customer/transactionController");
const userController = require("../../controllers/admin/maintabs/userController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");


//FIX ALL PERM HERE

router.route("/")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), userController.editProfile)
.get(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), userController.getMyProfile)

router.route("/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD),userController.editProfilePassword);


// customer
router.route("/my-job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), myJobOrderController.getAllMyJobOrders);

router.route("/customer/transactions")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), transactionController.getAllTransactions);


router.route("/my-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), myJobOrderController.getMyJobOrder);

// contractor
router.route("/assigned-job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), assignedJobOrderController.getAllAssignedJobOrders);

router.route("/contractor/finances")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES), financeController.getAllLabor)

router.route("/assigned-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES), assignedJobOrderController.getAssignedJobOrder)

router.route("/assigned-job-orders/:id/:action")
.patch(verifyPermission(PERMISSIONS_LIST.ACCEPT_JOB_ORDER), assignedJobOrderController.acceptJobOrder)



module.exports = router;

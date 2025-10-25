const express = require("express");
const router = express.Router();
const assignedJobOrderController = require("../../controllers/contractor/assignedJobOrderController");
const myJobOrderController = require("../../controllers/customer/myJobOrderController");
const contractorDashboardController = require("../../controllers/contractor/dashboardController");
const customerDashboardController = require("../../controllers/customer/dashboardController");
const financeController = require("../../controllers/contractor/financeController");
const transactionController = require("../../controllers/customer/transactionController");
const profileController = require("../../controllers/profileController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");
const createUploader = require("../../middleware/imageHandler");
const uploadImage = createUploader("users");


//FIX ALL PERM HERE

router.route("/")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), uploadImage, profileController.editProfile)
.get(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_DETAILS), profileController.getMyProfile)

router.route("/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD),profileController.editProfilePassword);


// customer
router.route("/customer-dashboard")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), customerDashboardController.getCustomerDashboard);

router.route("/my-job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), myJobOrderController.getAllMyJobOrders);

router.route("/customer/transactions")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_TRANSACTIONS), transactionController.getAllTransactions);

router.route("/my-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS), myJobOrderController.getMyJobOrder);




// contractor
router.route("/contractor-dashboard")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), contractorDashboardController.getContractorDashboard);

router.route("/assigned-job-orders")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS), assignedJobOrderController.getAllAssignedJobOrders);

router.route("/contractor/finances")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES), financeController.getAllLabor)

router.route("/assigned-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES), assignedJobOrderController.getAssignedJobOrder)

router.route("/assigned-job-orders/:id/:action")
.patch(verifyPermission(PERMISSIONS_LIST.ACCEPT_JOB_ORDER), assignedJobOrderController.acceptJobOrder)



module.exports = router;

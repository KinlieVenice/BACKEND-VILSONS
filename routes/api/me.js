const express = require("express");
const router = express.Router();
const assignedJobOrderController = require("../../controllers/contractor/assignedJobOrderController");
const permissionController = require("../../controllers/admin/permissionController");

const myJobOrderController = require("../../controllers/customer/myJobOrderController");
const contractorDashboardController = require("../../controllers/contractor/dashboardController");
const customerDashboardController = require("../../controllers/customer/dashboardController");
const truckController = require("../../controllers/customer/truckController");
const financeController = require("../../controllers/contractor/financeController");
const transactionController = require("../../controllers/customer/transactionController");
const profileController = require("../../controllers/profileController");
const verifyPermission = require("../../middleware/verifyPermissions");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");
const createUploader = require("../../middleware/imageHandler");
const uploadImage = createUploader("users");


//FIX ALL PERM HERE

router.route("/")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS), uploadImage, profileController.editProfile)
.get(verifyPermission(PERMISSIONS_LIST.VIEW_OWN_PROFILE), profileController.getMyProfile)

router.route("/permissions")
.get(permissionController.getUserPermissions)

router.route("/password")
.put(verifyPermission(PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS), profileController.editProfilePassword);


// customer
router.route("/customer-dashboard")
.get(customerDashboardController.getCustomerDashboard);


router.route("/customer-balance")
.get(verifyPermission(PERMISSIONS_LIST.CUSTOMER_DASHBOARD_BALANCE), customerDashboardController.getCustomerBalance);

router.route("/customer-status")
.get(verifyPermission(PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS), customerDashboardController.getCustomerRecentJobs);

router.route("/customer-recent-jobs")
.get(verifyPermission(PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS), customerDashboardController.getCustomerRecentJobs);

router
  .route("/my-job-orders/group/:statusGroup")
  .get(
    verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDERS),
    myJobOrderController.getAllMyJobOrders
  );

router.route("/my-trucks")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCKS), truckController.getAllMyTrucks);

router.route("/customer/transactions")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRANSACTIONS), transactionController.getAllTransactions);

router.route("/my-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDER_DETAILS), myJobOrderController.getMyJobOrder);

router.route("/my-trucks/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCK_DETAILS), truckController.getMyTruck);


// contractor
router.route("/contractor-dashboard")
.get(contractorDashboardController.getContractorDashboard);

router.route("/contractor-balance")
.get(verifyPermission(PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_BALANCE), contractorDashboardController.getContractorBalance);

router.route("/contractor-status")
.get(verifyPermission(PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS), contractorDashboardController.getContractorJobStatus);

router.route("/contractor-recent-jobs")
.get(verifyPermission(PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS), contractorDashboardController.getContractorRecentJobs);

router.route("/assigned-job-orders/group/:statusGroup")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS), assignedJobOrderController.getAllAssignedJobOrders);

router.route("/contractor/finances")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES), financeController.getAllLabor)

router.route("/assigned-job-orders/action/:action/:id")
.put(verifyPermission(PERMISSIONS_LIST.HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS), assignedJobOrderController.acceptJobOrder)

router.route("/assigned-job-orders/:id")
.get(verifyPermission(PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDER_DETAILS), assignedJobOrderController.getAssignedJobOrder)


module.exports = router;

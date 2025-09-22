const ROLES_LIST = require("../../constants/ROLES_LIST");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");
const permissionIdFinder = require("../../utils/permissionIdFinder");
const roleIdFinder = require("../../utils/roleIdFinder");

async function getRolePermissionData() {
  const admin = [
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_REVENUE_PROFIT_OVERVIEW
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_BRANCH),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_BRANCH),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_BRANCH),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_BRANCH),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_EXPENSES_OVERVIEW
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_CUSTOMER_BALANCE_OVERVIEW
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_JOB_ORDERS_OVERVIEW
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_JOB_ORDERS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_JOB_ORDER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_JOB_ORDER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_JOB_ORDER_STATUS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_JOB_ORDER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_OTHER_INCOMES
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_OTHER_INCOME
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_OTHER_INCOME
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_OTHER_INCOME
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_TRANSACTIONS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_TRANSACTION
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_TRANSACTION),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_TRANSACTION
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_REVENUE_PROFIT
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_MATERIALS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_EQUIPMENT),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_EQUIPMENT),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_EQUIPMENT),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_EQUIPMENT),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_LABOR),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_LABOR),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_LABOR),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_LABOR),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_OVERHEAD),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_OVERHEAD),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_OVERHEAD),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_OVERHEAD),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_TRUCKS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_SINGLE_TRUCK),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_TRUCKS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_TRUCKS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_TRUCK_OWNER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_TRUCKS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_ACTIVITY_LOGS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_USERS),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_SINGLE_USER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_USER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_USER_DETAILS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_USER_PASSWORD
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_USER),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_ROLES_PERMISSIONS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_ROLES_PERMISSIONS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_ROLES_PERMISSIONS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_ROLES_PERMISSIONS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_DETAILS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.ADMIN),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD
      ),
      approval: false,
    },
  ];

  const employee = [
    {
      roleId: await roleIdFinder(ROLES_LIST.EMPLOYEE),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_DETAILS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.EMPLOYEE),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD
      ),
      approval: false,
    },
  ];

  const contractor = [
    {
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_DETAILS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_ASSIGNED_JOB_ORDERS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER
      ),
      approval: false,
    },
  ];

  const customer = [
    {
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_DETAILS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_MY_JOB_ORDERS
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER
      ),
      approval: false,
    },
  ];

  const cashier = [
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_REVENUE_PROFIT_OVERVIEW
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_BRANCH),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_BRANCH),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_BRANCH),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_BRANCH),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_EXPENSES_OVERVIEW
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_CUSTOMER_BALANCE_OVERVIEW
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_JOB_ORDERS_OVERVIEW
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_JOB_ORDERS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_SINGLE_JOB_ORDER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_JOB_ORDER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_JOB_ORDER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_JOB_ORDER_STATUS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_JOB_ORDER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_OTHER_INCOMES
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_OTHER_INCOME
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_OTHER_INCOME
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_OTHER_INCOME
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_TRANSACTIONS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_TRANSACTION
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_TRANSACTION),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_TRANSACTION
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_REVENUE_PROFIT
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_MATERIALS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_EQUIPMENT),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_EQUIPMENT),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_EQUIPMENT),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_EQUIPMENT),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_LABOR),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_LABOR),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_LABOR),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_LABOR),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_OVERHEAD),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_OVERHEAD),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_OVERHEAD),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_OVERHEAD),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_TRUCKS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_SINGLE_TRUCK
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_TRUCKS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.EDIT_TRUCKS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_TRUCKS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_ACTIVITY_LOGS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_USERS),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_SINGLE_USER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.CREATE_USER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_USER_DETAILS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_USER_PASSWORD
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.DELETE_USER),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.VIEW_ROLES_PERMISSIONS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.CREATE_ROLES_PERMISSIONS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_ROLES_PERMISSIONS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.DELETE_ROLES_PERMISSIONS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_DETAILS
      ),
      approval: true,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.CASHIER),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_PROFILE_PASSWORD
      ),
      approval: true,
    },
  ];

  return [...admin, ...employee, ...contractor, ...customer, ...cashier];
}

module.exports = getRolePermissionData;

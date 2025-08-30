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
  ];

  return [
        ...admin,
        ...employee,
        ...contractor,
        ...customer
      ]
}

module.exports = getRolePermissionData;

const ROLES_LIST = require("../../constants/ROLES_LIST");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");
const roleIdFinder = require("../../utils/finders/roleIdFinder");
const permissionIdFinder = require("../../utils/finders/permissionIdFinder");

async function getRolePermissionData(tx) {
  // EXCLUDED PERMISSIONS FOR ADMIN
  const adminExcluded = [
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRANSACTIONS,
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES,
    PERMISSIONS_LIST.HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDER_DETAILS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDER_DETAILS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCKS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCK_DETAILS,
  ];

  // ADMIN GETS ALL PERMISSIONS EXCEPT THOSE ABOVE
  const admin = await Promise.all(
    Object.values(PERMISSIONS_LIST)
      .filter((p) => !adminExcluded.includes(p))
      .map(async (permissionKey) => ({
        roleId: await roleIdFinder(ROLES_LIST.ADMIN, tx),
        permissionId: await permissionIdFinder(permissionKey, tx),
        approval: false,
      }))
  );

  // EMPLOYEE — unchanged from your original logic
  const employee = [
    {
      roleId: await roleIdFinder(ROLES_LIST.EMPLOYEE, tx),
      permissionId: await permissionIdFinder(
        PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS, tx
      ),
      approval: false,
    },
    {
      roleId: await roleIdFinder(ROLES_LIST.EMPLOYEE, tx),
      permissionId: await permissionIdFinder(PERMISSIONS_LIST.VIEW_OWN_PROFILE, tx),
      approval: false,
    },
  ];

  // CONTRACTOR — ONLY these 7
  const contractorPermissions = [
    PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS,
    PERMISSIONS_LIST.VIEW_OWN_PROFILE,
    PERMISSIONS_LIST.VIEW_TRUCK_DETAILS,
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDER_DETAILS,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES,
    PERMISSIONS_LIST.HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS,
  ];

  const contractor = await Promise.all(
    contractorPermissions.map(async (permissionKey) => ({
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR, tx),
      permissionId: await permissionIdFinder(permissionKey, tx),
      approval: false,
    }))
  );

  // CUSTOMER — ONLY these 6
  const customerPermissions = [
    PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS,
    PERMISSIONS_LIST.VIEW_OWN_PROFILE,
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCKS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRUCK_DETAILS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDER_DETAILS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRANSACTIONS,
  ];

  const customer = await Promise.all(
    customerPermissions.map(async (permissionKey) => ({
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER, tx),
      permissionId: await permissionIdFinder(permissionKey, tx),
      approval: false,
    }))
  );

  return [...admin, ...employee, ...contractor, ...customer];
}

module.exports = getRolePermissionData;

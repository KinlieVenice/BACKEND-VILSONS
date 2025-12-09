const ROLES_LIST = require("../../constants/ROLES_LIST");
const PERMISSIONS_LIST = require("../../constants/PERMISSIONS_LIST");
const roleIdFinder = require("../../utils/finders/roleIdFinder");
const permissionIdFinder = require("../../utils/finders/permissionIdFinder");

async function getRolePermissionData() {
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
  ];

  // ADMIN GETS ALL PERMISSIONS EXCEPT THOSE ABOVE
  const admin = await Promise.all(
    Object.values(PERMISSIONS_LIST)
      .filter((p) => !adminExcluded.includes(p))
      .map(async (permissionKey) => ({
        roleId: await roleIdFinder(ROLES_LIST.ADMIN),
        permissionId: await permissionIdFinder(permissionKey),
        approval: false,
      }))
  );

  // EMPLOYEE — unchanged from your original logic
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

  // CONTRACTOR — ONLY these 5
  const contractorPermissions = [
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES,
    PERMISSIONS_LIST.HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS,
  ];

  const contractor = await Promise.all(
    contractorPermissions.map(async (permissionKey) => ({
      roleId: await roleIdFinder(ROLES_LIST.CONTRACTOR),
      permissionId: await permissionIdFinder(permissionKey),
      approval: false,
    }))
  );

  // CUSTOMER — ONLY these 4
  const customerPermissions = [
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS,
    PERMISSIONS_LIST.CUSTOMER_DASHBOARD_BALANCE,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDERS,
    PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRANSACTIONS,
  ];

  const customer = await Promise.all(
    customerPermissions.map(async (permissionKey) => ({
      roleId: await roleIdFinder(ROLES_LIST.CUSTOMER),
      permissionId: await permissionIdFinder(permissionKey),
      approval: false,
    }))
  );

  return [...admin, ...employee, ...contractor, ...customer];
}

module.exports = getRolePermissionData;

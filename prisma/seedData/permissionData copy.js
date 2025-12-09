async function getPermissionData() {

const permissions = [
  // ===== DASHBOARD =====
  {
    module: "Dashboard",
    permissionName: PERMISSIONS_LIST.ADMIN_DASHBOARD_REVENUE,
    method: "view",
    description: "View total and monthly revenue overview on dashboard",
  },
  {
    module: "Dashboard",
    permissionName: PERMISSIONS_LIST.ADMIN_DASHBOARD_PROFIT,
    method: "view",
    description: "View total and monthly profit overview on dashboard",
  },
  {
    module: "Dashboard",
    permissionName: PERMISSIONS_LIST.ADMIN_DASHBOARD_EXPENSES,
    method: "view",
    description: "View shop expenses summary on dashboard",
  },
  {
    module: "Dashboard",
    permissionName: PERMISSIONS_LIST.ADMIN_DASHBOARD_CUSTOMER_BALANCE,
    method: "view",
    description: "View total customer balances on dashboard",
  },
  {
    module: "Dashboard",
    permissionName: PERMISSIONS_LIST.ADMIN_DASHBOARD_JOB_ORDERS,
    method: "view",
    description: "View job order summary and recent orders on dashboard",
  },

  // ===== JOB ORDERS =====
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.VIEW_JOB_ORDERS,
    method: "view",
    description: "View all job orders",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.CREATE_JOB_ORDER,
    method: "create",
    description: "Create a new job order",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.EDIT_JOB_ORDER,
    method: "edit",
    description: "Edit job order details",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.VIEW_JOB_ORDER_DETAILS,
    method: "view",
    description: "View job order details",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.CHANGE_JOB_ORDER_STATUS,
    method: "edit",
    description: "Update job order status",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.DELETE_JOB_ORDER,
    method: "delete",
    description: "Delete a job order",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.HANDLE_COMPLETED_JOB_ORDERS,
    method: "edit",
    description: "Accept or reject job orders marked as completed",
  },
  {
    module: "Job_Orders",
    permissionName: PERMISSIONS_LIST.HANDLE_FOR_RELEASE_JOB_ORDERS,
    method: "edit",
    description: "Approve or reject job orders marked for release",
  },

  // ===== OTHER INCOMES =====
  {
    module: "Other_Incomes",
    permissionName: PERMISSIONS_LIST.VIEW_OTHER_INCOMES,
    method: "view",
    description: "View all other income records",
  },
  {
    module: "Other_Incomes",
    permissionName: PERMISSIONS_LIST.CREATE_OTHER_INCOME,
    method: "create",
    description: "Add new income record",
  },
  {
    module: "Other_Incomes",
    permissionName: PERMISSIONS_LIST.EDIT_OTHER_INCOME,
    method: "edit",
    description: "Edit existing income record",
  },
  {
    module: "Other_Incomes",
    permissionName: PERMISSIONS_LIST.DELETE_OTHER_INCOME,
    method: "delete",
    description: "Delete an income record",
  },

  // ===== TRANSACTIONS =====
  {
    module: "Transactions",
    permissionName: PERMISSIONS_LIST.VIEW_TRANSACTIONS,
    method: "view",
    description: "View all transactions",
  },
  {
    module: "Transactions",
    permissionName: PERMISSIONS_LIST.CREATE_TRANSACTION,
    method: "create",
    description: "Create a new transaction",
  },
  {
    module: "Transactions",
    permissionName: PERMISSIONS_LIST.EDIT_TRANSACTION,
    method: "edit",
    description: "Edit transaction details",
  },
  {
    module: "Transactions",
    permissionName: PERMISSIONS_LIST.DELETE_TRANSACTION,
    method: "delete",
    description: "Delete a transaction record",
  },

  // ===== REVENUE & PROFIT =====
  {
    module: "Finances_Revenue_And_Profit",
    permissionName: PERMISSIONS_LIST.VIEW_REVENUE_PROFIT,
    method: "view",
    description: "View shop’s revenue and profit breakdown",
  },

  // ===== MATERIALS =====
  {
    module: "Finances_Operational_Materials",
    permissionName: PERMISSIONS_LIST.VIEW_MATERIALS,
    method: "view",
    description: "View all materials used in operations",
  },

  // ===== EQUIPMENTS =====
  {
    module: "Finances_Operational_Equipment",
    permissionName: PERMISSIONS_LIST.VIEW_EQUIPMENTS,
    method: "view",
    description: "View all equipment expenses",
  },
  {
    module: "Finances_Operational_Equipment",
    permissionName: PERMISSIONS_LIST.CREATE_EQUIPMENT,
    method: "create",
    description: "Add new equipment expense",
  },
  {
    module: "Finances_Operational_Equipment",
    permissionName: PERMISSIONS_LIST.EDIT_EQUIPMENT,
    method: "edit",
    description: "Edit equipment expense details",
  },
  {
    module: "Finances_Operational_Equipment",
    permissionName: PERMISSIONS_LIST.DELETE_EQUIPMENT,
    method: "delete",
    description: "Delete equipment record",
  },

  // ===== LABOR =====
  {
    module: "Finances_Operational_Labor",
    permissionName: PERMISSIONS_LIST.VIEW_LABORS,
    method: "view",
    description: "View labor-related expenses",
  },
  {
    module: "Finances_Operational_Labor",
    permissionName: PERMISSIONS_LIST.CREATE_LABOR,
    method: "create",
    description: "Add new labor expense",
  },
  {
    module: "Finances_Operational_Labor",
    permissionName: PERMISSIONS_LIST.EDIT_LABOR,
    method: "edit",
    description: "Edit labor expense details",
  },
  {
    module: "Finances_Operational_Labor",
    permissionName: PERMISSIONS_LIST.DELETE_LABOR,
    method: "delete",
    description: "Delete a labor expense record",
  },

  // ===== OVERHEAD =====
  {
    module: "Finances_Overhead",
    permissionName: PERMISSIONS_LIST.VIEW_OVERHEADS,
    method: "view",
    description: "View all overhead expenses",
  },
  {
    module: "Finances_Overhead",
    permissionName: PERMISSIONS_LIST.CREATE_OVERHEAD,
    method: "create",
    description: "Add new overhead expense",
  },
  {
    module: "Finances_Overhead",
    permissionName: PERMISSIONS_LIST.EDIT_OVERHEAD,
    method: "edit",
    description: "Edit overhead expense",
  },
  {
    module: "Finances_Overhead",
    permissionName: PERMISSIONS_LIST.DELETE_OVERHEAD,
    method: "delete",
    description: "Delete an overhead expense",
  },

  // ===== ACTIVITY LOGS =====
  {
    module: "Activity_Logs",
    permissionName: PERMISSIONS_LIST.VIEW_ACTIVITY_LOGS,
    method: "view",
    description: "View all user activity logs",
  },

  // ===== APPROVAL LOGS =====
  {
    module: "Approval_Logs",
    permissionName: PERMISSIONS_LIST.VIEW_APPROVAL_LOGS,
    method: "view",
    description: "View all approval requests",
  },
  {
    module: "Approval_Logs",
    permissionName: PERMISSIONS_LIST.HANDLE_APPROVAL_LOGS,
    method: "edit",
    description: "Approve or reject pending requests",
  },

  // ===== USERS =====
  {
    module: "Users_All_Users",
    permissionName: PERMISSIONS_LIST.VIEW_USERS,
    method: "view",
    description: "View all user accounts",
  },
  {
    module: "Users_All_Users",
    permissionName: PERMISSIONS_LIST.CREATE_USER,
    method: "create",
    description: "Create a new user account",
  },
  {
    module: "Users_All_Users",
    permissionName: PERMISSIONS_LIST.EDIT_USER,
    method: "edit",
    description: "Edit user details",
  },
  {
    module: "Users_All_Users",
    permissionName: PERMISSIONS_LIST.CHANGE_USER_PASSWORD,
    method: "edit",
    description: "Change user password",
  },
  {
    module: "Users_All_Users",
    permissionName: PERMISSIONS_LIST.DELETE_USER,
    method: "delete",
    description: "Delete user account",
  },

  // ===== BRANCHES =====
  {
    module: "Branches",
    permissionName: PERMISSIONS_LIST.VIEW_BRANCHES,
    method: "view",
    description: "View branch details",
  },
  {
    module: "Branches",
    permissionName: PERMISSIONS_LIST.CREATE_BRANCH,
    method: "create",
    description: "Create new branch",
  },
  {
    module: "Branches",
    permissionName: PERMISSIONS_LIST.EDIT_BRANCH,
    method: "edit",
    description: "Edit branch details",
  },
  {
    module: "Branches",
    permissionName: PERMISSIONS_LIST.DELETE_BRANCH,
    method: "delete",
    description: "Delete branch",
  },

  // ===== ROLES & PERMISSIONS =====
  {
    module: "Users_Roles_And_Permissions",
    permissionName: PERMISSIONS_LIST.VIEW_ROLES,
    method: "view",
    description: "View all roles and permissions",
  },
  {
    module: "Users_Roles_And_Permissions",
    permissionName: PERMISSIONS_LIST.CREATE_ROLE,
    method: "create",
    description: "Create new role",
  },
  {
    module: "Users_Roles_And_Permissions",
    permissionName: PERMISSIONS_LIST.EDIT_ROLE,
    method: "edit",
    description: "Edit role",
  },
  {
    module: "Users_Roles_And_Permissions",
    permissionName: PERMISSIONS_LIST.DELETE_ROLE,
    method: "delete",
    description: "Delete role",
  },

  // ===== OTHER RECORDS =====
  {
    module: "Contractors",
    permissionName: PERMISSIONS_LIST.VIEW_CONTRACTOR_DETAILS,
    method: "view",
    description: "View contractor records",
  },
  {
    module: "Customers",
    permissionName: PERMISSIONS_LIST.VIEW_CUSTOMER_DETAILS,
    method: "view",
    description: "View customer records",
  },
  {
    module: "Employees",
    permissionName: PERMISSIONS_LIST.VIEW_EMPLOYEE_DETAILS,
    method: "view",
    description: "View employee records",
  },

  // ===== DASHBOARDS =====
  {
    module: "Contractors",
    permissionName: PERMISSIONS_LIST.CONTRACTOR_DASHBOARD_JOB_ORDERS,
    method: "view",
    description: "View contractor job order dashboard",
  },
  {
    module: "Customers",
    permissionName: PERMISSIONS_LIST.CUSTOMER_DASHBOARD_JOB_ORDERS,
    method: "view",
    description: "View customer job order dashboard",
  },

  // ===== CUSTOMER OWN DATA =====
  {
    module: "Customers",
    permissionName: PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_JOB_ORDERS,
    method: "view",
    description: "View customer’s own job orders",
  },
  {
    module: "Customers",
    permissionName: PERMISSIONS_LIST.VIEW_CUSTOMER_OWN_TRANSACTIONS,
    method: "view",
    description: "View customer’s own transactions",
  },

  // ===== CONTRACTOR OWN DATA =====
  {
    module: "Contractors",
    permissionName: PERMISSIONS_LIST.VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    method: "view",
    description: "View contractor assigned job orders",
  },
  {
    module: "Contractors",
    permissionName: PERMISSIONS_LIST.VIEW_CONTRACTOR_FINANCES,
    method: "view",
    description: "View contractor finances",
  },
  {
    module: "Contractors",
    permissionName: PERMISSIONS_LIST.HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS,
    method: "edit",
    description: "Accept or reject job orders assigned to contractor",
  },

  // ===== PROFILE =====
  {
    module: "Profile",
    permissionName: PERMISSIONS_LIST.EDIT_OWN_PROFILE_DETAILS,
    method: "edit",
    description: "Edit own profile details",
  },
  {
    module: "Profile",
    permissionName: PERMISSIONS_LIST.VIEW_OWN_PROFILE,
    method: "view",
    description: "View own profile",
  },
];

  return permissions
}

module.exports = getPermissionData;

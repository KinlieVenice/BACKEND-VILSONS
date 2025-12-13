const PERMISSIONS_LIST = {
  CREATE_LABOR: "create_labor",
  VIEW_LABORS: "view_labors",
  EDIT_LABOR: "edit_labor",
  DELETE_LABOR: "delete_labor",

  CREATE_EQUIPMENT: "create_equipment",
  VIEW_EQUIPMENTS: "view_equipments",
  EDIT_EQUIPMENT: "edit_equipment",
  DELETE_EQUIPMENT: "delete_equipment",

  VIEW_MATERIALS: "view_materials",

  CREATE_OVERHEAD: "create_overhead",
  VIEW_OVERHEADS: "view_overheads",
  EDIT_OVERHEAD: "edit_overhead",
  DELETE_OVERHEAD: "delete_overhead",

  VIEW_ACTIVITY_LOGS: "view_activity_logs",

  VIEW_APPROVAL_LOGS: "view_approval_logs",
  HANDLE_APPROVAL_LOGS: "handle_approval_logs",

  //
  ADMIN_DASHBOARD_REVENUE: "view_admin_dashboard_revenue",
  ADMIN_DASHBOARD_EXPENSES: "view_admin_dashboard_expenses",
  ADMIN_DASHBOARD_PROFIT: "view_admin_dashboard_profit",
  ADMIN_DASHBOARD_CUSTOMER_BALANCE: "view_admin_dashboard_customer_balance",
  ADMIN_DASHBOARD_JOB_ORDERS: "view_admin_dashboard_job_orders",

  VIEW_REVENUE_PROFIT: "view_revenue_profit",

  CREATE_JOB_ORDER: "create_job_order",
  VIEW_JOB_ORDERS: "view_job_orders",
  VIEW_JOB_ORDER_DETAILS: "view_job_order_details",
  EDIT_JOB_ORDER: "edit_job_order",
  DELETE_JOB_ORDER: "delete_job_order",
  CHANGE_JOB_ORDER_STATUS: "change_job_order_status",
  HANDLE_COMPLETED_JOB_ORDERS: "handle_completed_job_orders",
  HANDLE_FOR_RELEASE_JOB_ORDERS: "handle_for_release_job_orders",

  CREATE_OTHER_INCOME: "create_other_income",
  VIEW_OTHER_INCOMES: "view_other_incomes",
  EDIT_OTHER_INCOME: "edit_other_income",
  DELETE_OTHER_INCOME: "delete_other_income",

  CREATE_TRANSACTION: "create_transaction",
  VIEW_TRANSACTIONS: "view_transactions",
  EDIT_TRANSACTION: "edit_transaction",
  DELETE_TRANSACTION: "delete_transaction",

  CREATE_TRUCK: "create_truck",
  VIEW_TRUCKS: "view_trucks",
  VIEW_TRUCK_DETAILS: "view_truck_details",
  EDIT_TRUCK: "edit_truck",
  DELETE_TRUCK: "delete_truck",
  CHANGE_TRUCK_OWNER: "change_truck_owner",

  CREATE_USER: "create_user",
  VIEW_USERS: "view_users",
  VIEW_USER_DETAILS: "view_user_details",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",
  CHANGE_USER_PASSWORD: "change_user_password",

  VIEW_CONTRACTOR_DETAILS: "view_contractor_details",
  VIEW_CUSTOMER_DETAILS: "view_customer_details",
  VIEW_EMPLOYEE_DETAILS: "view_employee_details",

  CREATE_BRANCH: "create_branch",
  VIEW_BRANCHES: "view_branches",
  EDIT_BRANCH: "edit_branch",
  DELETE_BRANCH: "delete_branch",

  EDIT_OWN_PROFILE_DETAILS: "edit_own_profile_details",
  VIEW_OWN_PROFILE: "view_own_profile",

  CUSTOMER_DASHBOARD_JOB_ORDERS: "view_customer_dashboard_job_orders",
  CUSTOMER_DASHBOARD_BALANCE: "view_customer_dashboard_balance",

  VIEW_CUSTOMER_OWN_JOB_ORDERS: "view_customer_own_job_orders",
  VIEW_CUSTOMER_OWN_JOB_ORDER_DETAILS: "view_customer_own_job_order_details",
  VIEW_CUSTOMER_OWN_TRANSACTIONS: "view_customer_own_transactions",
  VIEW_CUSTOMER_OWN_TRUCKS: "view_customer_own_trucks",
  VIEW_CUSTOMER_OWN_TRUCK_DETAILS: "view_customer_own_truck_details",

  CONTRACTOR_DASHBOARD_JOB_ORDERS: "view_contractor_dashboard_job_orders",
  CONTRACTOR_DASHBOARD_BALANCE: "view_contractor_dashboard_balance",

  VIEW_CONTRACTOR_ASSIGNED_JOB_ORDERS: "view_contractor_assigned_job_orders",
  VIEW_CONTRACTOR_ASSIGNED_JOB_ORDER_DETAILS: "view_contractor_assigned_job_order_details",
  VIEW_CONTRACTOR_FINANCES: "view_contractor_finances",
  HANDLE_CONTRACTOR_ASSIGNED_JOB_ORDERS:
    "handle_contractor_assigned_job_orders",

  CREATE_ROLE_PERMISSION: "create_role_permission",
  VIEW_ROLE_PERMISSIONS: "view_role_permissions",
  EDIT_ROLE_PERMISSION: "edit_role_permission",
  DELETE_ROLE_PERMISSION: "delete_role_permission",
};

module.exports = PERMISSIONS_LIST;

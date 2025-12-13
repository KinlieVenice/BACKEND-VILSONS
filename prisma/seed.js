const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const defaultPassword = require("../utils/defaultPassword");
const ROLES_LIST = require("../constants/ROLES_LIST");
const roleIdFinder = require("../utils/finders/roleIdFinder");
const branchIdFinder = require("../utils/finders/branchIdFinder");
const getRolePermissionData = require("../prisma/seedData/rolePermissionData");
const getPermissionData = require("../prisma/seedData/permissionData");

async function main() {
  /* ============================
     TRANSACTION 1: CORE DATA
  ============================ */
  await prisma.$transaction(async (tx) => {
    /* ---------- Users ---------- */
    const hashedPassword = await defaultPassword();
    await tx.user.createMany({
      data: [
        {
          fullName: "Super Admin",
          username: "superadmin",
          phone: "09000000000",
          email: "superadmin@vilsons.com",
          hashPwd: hashedPassword,
        },
      ],
      skipDuplicates: true,
    });

    /* ---------- Base Roles ---------- */
    await tx.role.createMany({
      data: [
        { roleName: "_ADMIN_", baseRoleId: null, isCustom: false },
        { roleName: "_EMPLOYEE_", baseRoleId: null, isCustom: false },
        { roleName: "_CONTRACTOR_", baseRoleId: null, isCustom: false },
        { roleName: "_CUSTOMER_", baseRoleId: null, isCustom: false },
      ],
      skipDuplicates: true,
    });

    /* ---------- Permissions ---------- */
    await tx.permission.createMany({
      data: await getPermissionData(),
      skipDuplicates: true,
    });

    await tx.rolePermission.createMany({
      data: await getRolePermissionData(tx),
      skipDuplicates: true,
    });

    /* ---------- Derived Roles ---------- */
    const baseRoles = await tx.role.findMany({
      where: {
        roleName: {
          in: ["_ADMIN_", "_EMPLOYEE_", "_CONTRACTOR_", "_CUSTOMER_"],
        },
      },
    });
    const roleMap = Object.fromEntries(
      baseRoles.map((r) => [r.roleName, r.id])
    );

    await tx.role.createMany({
      data: [
        {
          roleName: "superadmin",
          baseRoleId: roleMap["_ADMIN_"],
          isCustom: true,
        },
        { roleName: "admin", baseRoleId: roleMap["_ADMIN_"], isCustom: true },
        {
          roleName: "employee",
          baseRoleId: roleMap["_EMPLOYEE_"],
          isCustom: true,
        },
        {
          roleName: "contractor",
          baseRoleId: roleMap["_CONTRACTOR_"],
          isCustom: true,
        },
        {
          roleName: "customer",
          baseRoleId: roleMap["_CUSTOMER_"],
          isCustom: true,
        },
      ],
      skipDuplicates: true,
    });

    /* ---------- Branch ---------- */
    await tx.branch.createMany({
      data: [
        {
          branchName: "main",
          address: "Laguna",
          createdByUser: "superadmin",
          updatedByUser: "superadmin",
        },
      ],
      skipDuplicates: true,
    });
  });

  /* ============================
     TRANSACTION 2: RELATIONSHIPS
  ============================ */
  await prisma.$transaction(async (tx) => {
    const superAdmin = await tx.user.findUnique({
      where: { username: "superadmin" },
    });

    /* ---------- Admin Table ---------- */
    await tx.admin.createMany({
      data: [{ userId: superAdmin.id }],
      skipDuplicates: true,
    });

    /* ---------- User Role ---------- */
    const superadminRoleId = await roleIdFinder("superadmin", tx);
    await tx.userRole.createMany({
      data: [{ userId: superAdmin.id, roleId: superadminRoleId }],
      skipDuplicates: true,
    });

    /* ---------- Base Role Permissions ---------- */
    const baseRolePermissions = await getRolePermissionData();

    // Assign base role permissions to both base and derived roles
    const derivedRoles = [
      "superadmin",
      "admin",
      "employee",
      "contractor",
      "customer",
    ];
    for (const derived of derivedRoles) {
      const derivedRoleId = await roleIdFinder(derived, tx);
      const rolePermissionsToInsert = baseRolePermissions.map((p) => ({
        roleId: derivedRoleId,
        permissionId: p.permissionId,
        approval: p.approval,
      }));
      await tx.rolePermission.createMany({
        data: rolePermissionsToInsert,
        skipDuplicates: true,
      });
    }

    /* ---------- User Branch ---------- */
    const mainBranchId = await branchIdFinder("main", tx);
    await tx.userBranch.createMany({
      data: [{ userId: superAdmin.id, branchId: mainBranchId }],
      skipDuplicates: true,
    });
  });
}

/* ============================
   RUN
============================ */
main()
  .then(() => {
    console.log("✅ Seeding complete!");
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    prisma.$disconnect();
    process.exit(1);
  });

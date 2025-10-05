const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const defaultPassword = require("../utils/defaultPassword");
const ROLES_LIST = require("../constants/ROLES_LIST");
const roleIdFinder = require("../utils/roleIdFinder");
const branchIdFinder = require("../utils/branchIdFinder");
const getRolePermissionData = require("../prisma/seedData/rolePermissionData");
const getPermissionData = require("../prisma/seedData/permissionData");

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.user.createMany({
      data: [
        {
          fullName: "Super Admin",
          username: "superadmin",
          phone: "09000000000",
          email: "superadmin@vilsons.com",
          hashPwd: await defaultPassword(),
        },
      ],
      skipDuplicates: true,
    });

    await tx.role.createMany({
      data: [
        { roleName: "admin", baseRoleId: null, isCustom: false },
        { roleName: "employee", baseRoleId: null, isCustom: false },
        { roleName: "contractor", baseRoleId: null, isCustom: false },
        { roleName: "customer", baseRoleId: null, isCustom: false },
        { roleName: "cashier", baseRoleId: null, isCustom: false },
      ],
      skipDuplicates: true,
    });

    await tx.permission.createMany({
      data: await getPermissionData(),
      skipDuplicates: true,
    });

    await tx.branch.createMany({
      data: [
        {
          branchName: "main",
          address: "Laguna",
          createdByUser: "superadmin",
          updatedByUser: "superadmin"
        },
      ],
      skipDuplicates: true,
    });
  });

  await prisma.$transaction(async (tx) => {
    const superAdmin = await tx.user.findUnique({
      where: { username: "superadmin" },
    });

    await tx.userRole.createMany({
      data: [
        {
          userId: superAdmin.id,
          roleId: await roleIdFinder(ROLES_LIST.ADMIN),
        },
      ],
      skipDuplicates: true,
    });

    await tx.rolePermission.createMany({
      data: await getRolePermissionData(),
      skipDuplicates: true,
    });

     await tx.userBranch.createMany({
       data: [
         {
           userId: superAdmin.id,
           branchId: await branchIdFinder("main"),
         },
       ],
       skipDuplicates: true,
     });

    
  });
}

main()
  .then(() => {
    console.log("Seeding complete!");
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });

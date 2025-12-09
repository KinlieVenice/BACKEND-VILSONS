const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const defaultPassword = require("../utils/defaultPassword");
const ROLES_LIST = require("../constants/ROLES_LIST");
const roleIdFinder = require("../utils/finders/roleIdFinder");
const branchIdFinder = require("../utils/finders/branchIdFinder");
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
        { roleName: "_admin_", baseRoleId: null, isCustom: false },
        { roleName: "_employee_", baseRoleId: null, isCustom: false },
        { roleName: "_contractor_", baseRoleId: null, isCustom: false },
        { roleName: "_customer_", baseRoleId: null, isCustom: false },
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

    await tx.admin.createMany({
      data: [
        { userId: superAdmin.id }
      ],
      skipDuplicates: true,
    })

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




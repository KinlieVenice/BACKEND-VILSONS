const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const defaultPassword = require("../utils/defaultPassword");
const ROLES_LIST = require("../constants/ROLES_LIST");
const roleIdFinder = require("../utils/roleIdFinder");
const branchIdFinder = require("../utils/branchIdFinder");
const getRolePermissionData = require("../prisma/seedData/rolePermissionData");
const getPermissionData = require("../prisma/seedData/permissionData");

/*
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

  */

async function tableExists(modelName) {
  try {
    await prisma.$queryRawUnsafe(`SELECT 1 FROM \`${modelName}\` LIMIT 1;`);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    // --- USERS ---
    if (await tableExists("User")) {
      const superAdminData = {
        fullName: "Super Admin",
        username: "superadmin",
        phone: "09000000000",
        email: "superadmin@vilsons.com",
        hashPwd: await defaultPassword(),
      };
      await prisma.user.createMany({
        data: [superAdminData],
        skipDuplicates: true,
      });
    } else {
      console.log("Skipping User table: does not exist yet");
    }

    // --- ROLES ---
    if (await tableExists("Role")) {
      const rolesData = [
        { roleName: "admin", baseRoleId: null, isCustom: false },
        { roleName: "employee", baseRoleId: null, isCustom: false },
        { roleName: "contractor", baseRoleId: null, isCustom: false },
        { roleName: "customer", baseRoleId: null, isCustom: false },
        { roleName: "cashier", baseRoleId: null, isCustom: false },
      ];
      await prisma.role.createMany({
        data: rolesData,
        skipDuplicates: true,
      });
    }

    // --- PERMISSIONS ---
    if (await tableExists("Permission")) {
      const permissionsData = await getPermissionData();
      await prisma.permission.createMany({
        data: permissionsData,
        skipDuplicates: true,
      });
    }

    // --- BRANCHES ---
    if (await tableExists("Branch")) {
      const branchData = [
        {
          branchName: "main",
          address: "Laguna",
          createdByUser: "superadmin",
          updatedByUser: "superadmin",
        },
      ];
      await prisma.branch.createMany({
        data: branchData,
        skipDuplicates: true,
      });
    }

    // --- USER ROLE ---
    if ((await tableExists("User")) && (await tableExists("UserRole")) && (await tableExists("Role"))) {
      const superAdmin = await prisma.user.findUnique({
        where: { username: "superadmin" },
      });
      if (superAdmin) {
        const adminRoleId = await roleIdFinder(ROLES_LIST.ADMIN);
        await prisma.userRole.createMany({
          data: [
            { userId: superAdmin.id, roleId: adminRoleId },
          ],
          skipDuplicates: true,
        });
      }
    }

    // --- ROLE PERMISSIONS ---
    if ((await tableExists("RolePermission")) && (await tableExists("Permission")) && (await tableExists("Role"))) {
      const rolePermissionData = await getRolePermissionData();
      for (const chunk of chunkArray(rolePermissionData, 50)) {
        await prisma.rolePermission.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      }
    }

    // --- USER BRANCH ---
    if ((await tableExists("UserBranch")) && (await tableExists("User")) && (await tableExists("Branch"))) {
      const superAdmin = await prisma.user.findUnique({
        where: { username: "superadmin" },
      });
      const mainBranchId = await branchIdFinder("main");
      if (superAdmin && mainBranchId) {
        await prisma.userBranch.createMany({
          data: [
            { userId: superAdmin.id, branchId: mainBranchId },
          ],
          skipDuplicates: true,
        });
      }
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Utility to split large arrays into smaller chunks
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

main();

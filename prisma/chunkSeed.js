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
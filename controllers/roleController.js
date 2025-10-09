
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createRole = async (req, res) => {
  try {
    const { name, baseRoleId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirst({
        where: { roleName: name }
      })
      if (role) return res.status(400).json({ message: "Role already exists" })

      // Step 1: Create the new role
      const newRole = await tx.role.create({
        data: {
          roleName: name.trim(),
          isCustom: Boolean(baseRoleId), // true if based on another role
          baseRoleId: baseRoleId || null,
          createdByUser: req.username
        },
      });

      let clonedPermissions = [];

      // Step 2: Clone permissions if baseRoleId exists
      if (baseRoleId) {
        const baseRole = await tx.role.findUnique({
          where: { id: baseRoleId },
          include: { permissions: true },
        });

        if (!baseRole) {
          throw new Error("Base role not found");
        }

        if (baseRole.permissions.length > 0) {
          const newRolePermissions = baseRole.permissions.map((rp) => ({
            roleId: newRole.id,
            permissionId: rp.permissionId,
            approval: rp.approval,
          }));

          await tx.rolePermission.createMany({ data: newRolePermissions });

          clonedPermissions = await tx.rolePermission.findMany({
            where: { roleId: newRole.id },
            include: { permission: true },
          });
        }
      }

      // Step 3: Return newly created role with cloned permissions
      return {
        message: baseRoleId
          ? "Role cloned successfully from base role"
          : "New role created successfully",
        role: {
          ...newRole,
          permissions: clonedPermissions,
        },
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const editRolePermission = async (req, res) => {
  const { roleId } = req.params;
  const { add = [], remove = [], update = [] } = req.body;

  if (!roleId) {
    return res.status(400).json({ error: "Missing roleId parameter" });
  }

  try {
    const summary = { added: 0, removed: 0, updated: 0 };

    await prisma.$transaction(async (tx) => {
      // ADD — bulk insert with createMany
      // if (add.length > 0) {
      //   const addedPermissions = add.map((perm) => ({
      //     roleId,
      //     permissionId: perm.permissionId,
      //     approval: perm.approval ?? false,
      //   }));

      //   const added = await tx.rolePermission.createMany({
      //     data: addedPermissions,
      //     skipDuplicates: true,
      //   });

      //   summary.added += added.count;
      // }

      const role = await tx.role.findFirst({
        where: { id: roleId }
      })
      if (!role) return res.status(400).json({ message: "Role doesn't exist"})

      // REMOVE — bulk delete with deleteMany
      if (remove.length > 0) {
        const permissionIdsToRemove = remove.map((p) => p.permissionId);
        const deleted = await tx.rolePermission.deleteMany({
          where: {
            roleId,
            permissionId: { in: permissionIdsToRemove },
          },
        });
        summary.removed += deleted.count;
      }

      // 3️⃣ UPDATE — map-based parallel updates (bulk style)
      if (update.length > 0) {
        const results = await Promise.all(
          update.map((perm) =>
            tx.rolePermission.updateMany({
              where: {
                roleId,
                permissionId: perm.permissionId,
              },
              data: {
                approval: perm.approval ?? false,
              },
            })
          )
        );

        summary.updated += results.reduce((acc, curr) => acc + curr.count, 0);
      }
    });

    return res.json({
      message: "Role permissions updated successfully",
      summary,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Duplicate permission assignment detected" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createRole, editRolePermission };


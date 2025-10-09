
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updates = [];

      // ✅ Add new permissions
      if (add.length > 0) {
        const dataToAdd = add.map((p) => ({
          roleId,
          permissionId: p.permissionId,
          approval: p.approval ?? false,
        }));

        await tx.rolePermission.createMany({
          data: dataToAdd,
          skipDuplicates: true, // prevents unique constraint error
        });

        updates.push(`Added ${dataToAdd.length} permission(s)`);
      }

      // ✅ Remove permissions
      if (remove.length > 0) {
        await tx.rolePermission.deleteMany({
          where: {
            roleId,
            permissionId: { in: remove },
          },
        });

        updates.push(`Removed ${remove.length} permission(s)`);
      }

      // ✅ Update permissions (e.g. approval value)
      if (update.length > 0) {
        for (const p of update) {
          await tx.rolePermission.updateMany({
            where: { roleId, permissionId: p.permissionId },
            data: { approval: p.approval },
          });
        }

        updates.push(`Updated ${update.length} permission(s)`);
      }

      // ✅ Return updated permission list
      const updatedPermissions = await tx.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
      });

      return {
        message: "Role permissions updated successfully",
        summary: updates,
        updatedPermissions,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error editing role permissions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { createRole, editRolePermission };



const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getMainBaseRole = require("../../utils/getMainBaseRole.js");

const createRole = async (req, res) => {
  try {
    const { name, baseRoleId } = req.body;

    if (!name || name.trim() === "" ||  !baseRoleId) {
      return res.status(400).json({ error: "name and baseRoleId is required" });
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
          baseRoleId: baseRoleId,
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
      // ✅ Validate role existence
      const role = await tx.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        return res.status(400).json({ message: "Role doesn't exist" });
      }

      // ✅ Check permission existence before removing or updating
      const existingPermissions = await tx.rolePermission.findMany({
        where: { roleId },
        select: { permissionId: true },
      });
      const existingIds = new Set(existingPermissions.map((p) => p.permissionId));

      // 🧩 Validate remove permissions
      for (const perm of remove) {
        if (!existingIds.has(perm.permissionId)) {
          return res
            .status(400)
            .json({ message: `Permission ${perm.permissionId} doesn't exist for this role` });
        }
      }

      // 🧩 Validate update permissions
      for (const perm of update) {
        if (!existingIds.has(perm.permissionId)) {
          return res
            .status(400)
            .json({ message: `Permission ${perm.permissionId} doesn't exist for this role` });
        }
      }

      // ✅ REMOVE — bulk delete with deleteMany
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

      // ✅ UPDATE — parallel update with Promise.all
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

      // (optional: you can re-enable your add block if you need it later)
    });

    return res.json({
      message: "Role permissions updated successfully",
      summary,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getRolePermissions = async (req, res) => {
  const { roleId } = req.params;

  if (!roleId) {
    return res.status(400).json({ error: "Missing roleId parameter" });
  }

  try {
    // ✅ Fetch the current role
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // ✅ Use your utility to find the top-most base role name
    const mainBaseRoleName = await getMainBaseRole(prisma, role.baseRoleId);

    // ✅ Get the actual base role record if it exists
    let basePermissions = [];
    if (mainBaseRoleName) {
      const baseRole = await prisma.role.findFirst({
        where: { roleName: mainBaseRoleName },
        include: {
          permissions: { include: { permission: true } },
        },
      });
      if (baseRole) basePermissions = baseRole.permissions;
    }

    const rolePermissions = role.permissions;

    // ✅ Map role’s own permissions
    const rolePermissionMap = new Map(
      rolePermissions.map((rp) => [rp.permissionId, rp])
    );

    // ✅ Merge base and role permissions
    const allPermissions = basePermissions.length
      ? basePermissions.map((bp) => {
          const override = rolePermissionMap.get(bp.permissionId);
          return {
            permissionId: bp.permissionId,
            permissionName: bp.permission.permissionName,
            allowed: Boolean(override),
            approval: override ? override.approval : bp.approval,
          };
        })
      : rolePermissions.map((rp) => ({
          permissionId: rp.permissionId,
          permissionName: rp.permission.permissionName,
          allowed: true,
          approval: rp.approval,
        }));

    // ✅ Add child-only permissions
    const basePermissionIds = new Set(basePermissions.map((bp) => bp.permissionId));
    const extraChildPermissions = rolePermissions
      .filter((rp) => !basePermissionIds.has(rp.permissionId))
      .map((rp) => ({
        permissionId: rp.permissionId,
        permissionName: rp.permission.permissionName,
        allowed: true,
        approval: rp.approval,
      }));

    const finalPermissions = [...allPermissions, ...extraChildPermissions];

    return res.json({
      roleId,
      baseRoleId: role.baseRoleId,
      mainBaseRole: mainBaseRoleName || null,
      permissions: finalPermissions,
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();

    return res.status(200).json({ data: { roles } })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}


const getRolePermission = async (req, res) => {
  if (!req?.params?.roleId) return res.status(404).json({ message: "Id needed"});

  try {
    const result = await prisma.$transaction(async (tx) => {
        const role = await tx.role.findFirst({
          where: { id: req.params.roleId },
          include: { permissions: {  include: { permission: true } }}
        })
        return role
    })
    return res.status(200).json({ data: result })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports = { createRole, editRolePermission, getRolePermission, getRolePermissions, getAllRoles };


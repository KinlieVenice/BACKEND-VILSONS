
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getMainBaseRole = require("../../utils/services/getMainBaseRole.js");
const relationsChecker = require("../../utils/services/relationsChecker.js")
const { logActivity } = require("../../utils/services/activityService.js");


const createRoleOLD = async (req, res) => {
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

const createRole = async (req, res) => {
  try {
    const { roleName, baseRoleId, permissions } = req.body;

    if (!roleName || roleName.trim() === "") {
      return res.status(400).json({ error: "Role roleName is required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if role already exists
      const existingRole = await tx.role.findFirst({
        where: { roleName: roleName.trim() },
      });

      if (existingRole) {
        throw new Error("Role already exists");
      }

      // Step 1: Create the new role
      const newRole = await tx.role.create({
        data: {
          roleName: roleName.trim(),
          isCustom: Boolean(baseRoleId || permissions),
          baseRoleId: baseRoleId,
          createdByUser: req.username,
        },
      });

      let finalPermissions = [];

      // Step 2: Handle permissions - from base role, array, or grouped object
      if (baseRoleId && (!permissions || (!Array.isArray(permissions) && typeof permissions !== "object"))) {
        // Clone permissions from base role
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

          finalPermissions = await tx.rolePermission.findMany({
            where: { roleId: newRole.id },
            include: { permission: true },
          });
        }

      } else if (permissions) {
        // Normalize permissions whether it's an array or an object
        let flatPermissions = [];

        if (Array.isArray(permissions)) {
          flatPermissions = permissions;
        } else if (typeof permissions === "object") {
          flatPermissions = Object.values(permissions).flat();
        }

        const toCreate = [];

        for (const item of flatPermissions) {
          const { permissionId, allowed, approval } = item;

          // 🔹 Normalize to boolean
          const isAllowed = allowed === true || allowed === "true" || allowed === 1;

          if (isAllowed) {
            toCreate.push({
              roleId: newRole.id,
              permissionId,
              approval: Boolean(approval),
            });
          }
        }

        if (toCreate.length > 0) {
          await tx.rolePermission.createMany({ data: toCreate });
        }

        finalPermissions = await tx.rolePermission.findMany({
          where: { roleId: newRole.id },
          include: { permission: true },
        });
      }

      // Step 3: Return newly created role with permissions
      return {
        message:
          baseRoleId && (!permissions || (!Array.isArray(permissions) && typeof permissions !== "object"))
            ? "Role cloned successfully from base role"
            : "New role created successfully with permissions",
        role: {
          ...newRole,
          permissions: finalPermissions,
        },
        summary:
          permissions && (Array.isArray(permissions) || typeof permissions === "object")
            ? {
                created: finalPermissions.length,
                skipped: Array.isArray(permissions)
                  ? permissions.filter((p) => p.allowed === false || p.allowed === "false").length
                  : Object.values(permissions)
                      .flat()
                      .filter((p) => p.allowed === false || p.allowed === "false").length,
              }
            : undefined,
      };
    });

    await logActivity(
      req.username,
      needsApproval
        ? `FOR APPROVAL: ${req.username} created Role ${roleName}`
        : `${req.username} created Role ${roleName}`
    );

    return res.status(201).json(result);
  } catch (err) {
    console.error("Error creating role:", err);
    return res.status(500).json({ message: err.message });
  }
};

const editRolePermissions = async (req, res) => {
  const { roleId } = req.params;
  const { roleName, permissions } = req.body; // permissions = grouped object

  if (!roleId) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  if (!permissions || typeof permissions !== "object") {
    return res.status(400).json({ message: "Permissions must be an object" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Update role name (if provided)
      if (roleName) {
        const role = await tx.role.findFirst({
           where: {
            roleName,
            NOT: { id: roleId }, 
          },
        })

        if (role) return res.status(400).json({ message: "Role name already exists"})

        await tx.role.update({
          where: { id: roleId },
          data: { roleName },
        });
      }

      // 2️⃣ Flatten grouped permissions into one array
      const allPermissions = Object.values(permissions).flat();

      // 3️⃣ Get current permissions of this role
      const currentRolePermissions = await tx.rolePermission.findMany({
        where: { roleId },
        select: { id: true, permissionId: true, approval: true },
      });

      const currentMap = new Map(
        currentRolePermissions.map((rp) => [rp.permissionId, rp])
      );

      // 4️⃣ Prepare what to create, update, delete
      const toCreate = [];
      const toUpdate = [];
      const toDelete = [];

      for (const item of allPermissions) {
        const { permissionId, allowed, approval } = item;
        const existing = currentMap.get(permissionId);

        // Normalize allowed
        const isAllowed =
          allowed === true || allowed === "true" || allowed === 1;

        if (isAllowed) {
          if (!existing) {
            toCreate.push({
              roleId,
              permissionId,
              approval: Boolean(approval),
            });
          } else if (existing.approval !== Boolean(approval)) {
            toUpdate.push({ id: existing.id, approval: Boolean(approval) });
          }
        } else {
          if (existing) {
            toDelete.push(existing.id);
          }
        }
      }

      // 5️⃣ Execute DB changes
      if (toCreate.length > 0) {
        await tx.rolePermission.createMany({ data: toCreate });
      }

      for (const upd of toUpdate) {
        await tx.rolePermission.update({
          where: { id: upd.id },
          data: { approval: upd.approval },
        });
      }

      if (toDelete.length > 0) {
        await tx.rolePermission.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    });

    return res.status(200).json({
      message: "Role name and permissions updated successfully",
    });
  } catch (err) {
    console.error("Error updating role and permissions:", err);
    return res.status(500).json({ message: err.message });
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

const editRolePermissionsOld = async (req, res) => {
  const { roleId } = req.params;
  const updates = req.body; // full array from frontend

  if (!roleId) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "No permissions provided" });
  }

  try {
    // 1️⃣ Get current permissions of this role
    const currentRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { id: true, permissionId: true, approval: true },
    });

    // Convert to Map for fast lookups
    const currentMap = new Map(
      currentRolePermissions.map((rp) => [rp.permissionId, rp])
    );

    // 2️⃣ Prepare what to create/update/delete
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];

    for (const item of updates) {
      const { permissionId, allowed, approval } = item;
      const existing = currentMap.get(permissionId);

      if (allowed) {
        if (!existing) {
          // Permission newly allowed → create
          toCreate.push({ roleId, permissionId, approval });
        } else if (existing.approval !== approval) {
          // Approval changed → update
          toUpdate.push({ id: existing.id, approval });
        }
      } else {
        if (existing) {
          // No longer allowed → delete
          toDelete.push(existing.id);
        }
      }
    }

    // 3️⃣ Run all DB operations in transaction
    await prisma.$transaction(async (tx) => {
      // Create new permissions
      if (toCreate.length > 0) {
        await tx.rolePermission.createMany({ data: toCreate });
      }

      // Update changed approvals
      for (const upd of toUpdate) {
        await tx.rolePermission.update({
          where: { id: upd.id },
          data: { approval: upd.approval },
        });
      }

      // Delete removed permissions
      if (toDelete.length > 0) {
        await tx.rolePermission.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    });

    return res.status(200).json({
      message: "Role permissions updated successfully",
      summary: {
        created: toCreate.length,
        updated: toUpdate.length,
        deleted: toDelete.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating role permissions", error: error.message });
  }
};

const deleteRole = async (req, res) => {
  const { roleId } = req.params;

  if (!roleId) return res.status(400).json({ message: "Role ID is required" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.role.findFirst({
        where: { id: roleId },
        include: {
          permissions: true,
          users: true,
        }
      })

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      // 🔍 Check relations, but ignore roles/branches/edits
      const excludedKeys = ["permissions"];
      const hasRelations = relationsChecker(role, excludedKeys);

      if (hasRelations) {
        return res.status(400).json({ message: "Cannot delete this role. Please unassign this role from all users before deleting it."});
      } else {
        await tx.rolePermission.deleteMany({
          where: { roleId }
        })
        await tx.role.deleteMany({
          where: { id: roleId }
        })
      }
      
    })

    return res.status(200).json({ message: "Role successfully deleted" })
  } catch (err) {
    return res.status(500).json({ message: err.message})
  }
}


const getRolePermissions = async (req, res) => {
  const { roleId } = req.params;

  if (!roleId) {
    return res.status(400).json({ error: "Missing roleId parameter" });
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const mainBaseRoleName = await getMainBaseRole(prisma, role.baseRoleId);

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

    // ✅ Merge logic (same as before)
    const rolePermissionMap = new Map(
      rolePermissions.map((rp) => [rp.permissionId, rp])
    );

    let combinedPermissions = [];

    if (!mainBaseRoleName) {
      combinedPermissions = rolePermissions.map((rp) => ({
        module: rp.permission.module,
        method: rp.permission.method,
        permissionId: rp.permissionId,
        permissionName: rp.permission.permissionName,
        allowed: true,
        approval: rp.approval,
      }));
    } else {
      const basePermissionIds = new Set(basePermissions.map((bp) => bp.permissionId));

      const allPermissions = basePermissions.map((bp) => {
        const override = rolePermissionMap.get(bp.permissionId);
        return {
          module: bp.permission.module,
          method: bp.permission.method,
          permissionId: bp.permissionId,
          permissionName: bp.permission.permissionName,
          allowed: Boolean(override),
          approval: override ? override.approval : bp.approval,
        };
      });

      const extraChildPermissions = rolePermissions
        .filter((rp) => !basePermissionIds.has(rp.permissionId))
        .map((rp) => ({
          module: rp.permission.module,
          method: rp.permission.method,
          permissionId: rp.permissionId,
          permissionName: rp.permission.permissionName,
          allowed: true,
          approval: rp.approval,
        }));

      combinedPermissions = [...allPermissions, ...extraChildPermissions];
    }

    // ✅ Group by module
    const groupedPermissions = combinedPermissions.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push({
        method: perm.method,
        permissionId: perm.permissionId,
        permissionName: perm.permissionName,
        allowed: perm.allowed,
        approval: perm.approval,
      });
      return acc;
    }, {});

    // ✅ Sort permissions inside each module by method order
    const methodOrder = ["view", "create", "edit", "delete"];
    Object.keys(groupedPermissions).forEach((moduleName) => {
      groupedPermissions[moduleName].sort(
        (a, b) => methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method)
      );
    });

    return res.json({
      roleId,
      baseRoleId: role.baseRoleId,
      baseRoleName: mainBaseRoleName,
      roleName: role.roleName,
      isCustom: role.isCustom,
      permissions: groupedPermissions,
    });
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();

    // Add baseRoleName for each role
    const rolesWithBaseName = await Promise.all(
      roles.map(async (role) => {
        const baseRoleName = await getMainBaseRole(prisma, role.baseRoleId);
        return { ...role, baseRoleName };
      })
    );

    return res.status(200).json({ data: { roles: rolesWithBaseName } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createRole, editRolePermissions, deleteRole, getRolePermissions, getAllRoles };


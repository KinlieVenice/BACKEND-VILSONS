
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

    // ✅ If no base role, just return role permissions directly
    if (!mainBaseRoleName) {
      const finalPermissions = rolePermissions.map((rp) => ({
        permissionId: rp.permissionId,
        permissionName: rp.permission.permissionName,
        allowed: true,
        approval: rp.approval,
      }));

      return res.json({
        roleId,
        baseRoleId: role.baseRoleId,
        mainBaseRole: null,
        permissions: finalPermissions,
      });
    }

    // ✅ Only process merging logic if we have a base role
    const rolePermissionMap = new Map(
      rolePermissions.map((rp) => [rp.permissionId, rp])
    );

    // ✅ Merge base and role permissions
    const allPermissions = basePermissions.map((bp) => {
      const override = rolePermissionMap.get(bp.permissionId);
      return {
        permissionId: bp.permissionId,
        permissionName: bp.permission.permissionName,
        allowed: Boolean(override),
        approval: override ? override.approval : bp.approval,
      };
    });

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
      mainBaseRole: mainBaseRoleName,
      permissions: finalPermissions,
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({ error: error.message });
  }
};
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const permissionIdFinder = require("../utils/permissionIdFinder");


const verifyPermission = (allowedPermissions) => {
  return async (req, res, next) => {
    if (!req?.roles) return res.status(404).json({ message: "No roles assigned" });

    try {
      const roles = await Promise.all(
        req.roles.map((role) =>
          prisma.role.findFirst({
            where: { roleName: role },
            include: { permissions: { include: { permission: true, }, }, },
          })
        )
      );

      console.log(roles);

      const userPermissions = roles.flatMap((role) =>
        role.permissions.map((perm) => ({
          permissionId: perm.permissionId,
          approval: perm.approval,
        }))
      );

      console.log(userPermissions);

      const allowedPermissionId = await permissionIdFinder(allowedPermissions);

      const matchedPermission = userPermissions.find((perm) =>
        allowedPermissionId.includes(perm.permissionId)
      );

      if (!matchedPermission) {
        return res.status(403).json({ message: "Permission not found" });
      }

      req.approval = matchedPermission.approval;

      next();
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
};

module.exports = verifyPermission;

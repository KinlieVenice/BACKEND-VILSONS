const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const permissionIdFinder = require("../utils/permissionIdFinder");


const verifyPermission = (allowedPermissions) => {
  return async (req, res, next) => {
    if (!req?.roles) return res.sendStatus(404);

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

      const userPermissionsId = roles.flatMap((role) =>
        role.permissions.map((perm) => perm.permission.id)
      );

      console.log(userPermissionsId);

      const permissionId = await permissionIdFinder(allowedPermissions);
        
      const hasPermission = userPermissionsId.some((id) =>
        permissionId.includes(id)
      );

      console.log(hasPermission);

      if (!hasPermission) return res.sendStatus(403);

      next();
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
};

module.exports = verifyPermission;

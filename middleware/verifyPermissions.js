const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const permissionIdFinder = require("../utils/permissionIdFinder");
const PERMISSIONS_LIST = require("../constants/PERMISSIONS_LIST");

const verifyPermission = (...allowedPermissions) => {
  return async (req, res, next) => {
    if (!req?.roles) return res.sendStatus(404);

    try {
      const roles = await Promise.all(
        req.roles.map((r) =>
          prisma.role.findFirst({
            where: { roleName: r },
            include: { permissions: { include: { permission: true, }, }, },
          })
        )
      );

      console.log(roles);

      const userPermissions = roles.flatMap((role) =>
        role.permissions.map((perm) => perm.permission.id)
      );

      console.log(userPermissions);

      const hasPermission = userPermissions.some((id) =>
        allowedPermissions.includes(id)
      );

      console.log(hasPermission);

      console.log(await permissionIdFinder(PERMISSIONS_LIST.CREATE_USER));

      if (!hasPermission) return res.sendStatus(403);

      next();
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
};

module.exports = verifyPermission;

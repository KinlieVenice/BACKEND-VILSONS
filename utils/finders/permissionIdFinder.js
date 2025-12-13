const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const permissionIdFinder = async (permissionName, client = prisma) => {
  const permission = await client.permission.findUnique({
    where: { permissionName },
  });
  if (!permission) throw new Error(`Role "${permissionName}" not found`);
  return permission.id;
};


module.exports = permissionIdFinder;
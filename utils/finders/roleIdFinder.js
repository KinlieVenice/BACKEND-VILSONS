const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const roleIdFinder = async (roleName, client = prisma) => {
  const role = await client.role.findUnique({
    where: { roleName },
  });

  if (!role) throw new Error(`Role "${roleName}" not found`);
  return role.id;
};

module.exports = roleIdFinder;
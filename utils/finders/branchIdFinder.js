const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const branchIdFinder = async (branchName, client = prisma) => {
  const branch = await client.branch.findUnique({ where: { branchName } });
  if (!branch) throw new Error(`Branch "${branchName}" not found`);
  return branch.id;
};


module.exports = branchIdFinder;
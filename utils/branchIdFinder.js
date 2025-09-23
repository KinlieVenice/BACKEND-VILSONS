const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const branchIdFinder = async (branchName) => {
  const branch = await prisma.branch.findUnique({ where: { branchName } });
  if (!branch) throw new Error(`Branch "${branchName}" not found`);
  return branch.id;
};


module.exports = branchIdFinder;
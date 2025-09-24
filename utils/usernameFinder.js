const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const usernameFinder = async (roleTable, userId) => {
  const includeObj = {};
  includeObj[roleTable] = { include: { user: true } };

  const user = await prisma.user.findUnique({
    where: { id: userId }, // 👈 now we search by ID, not username
    include: includeObj,
  });

  if (!user || !user[roleTable]) {
    throw new Error(`${roleTable} for userId "${userId}" not found`);
  }

  // return both role and username if needed
  return user.username
};

module.exports = usernameFinder;

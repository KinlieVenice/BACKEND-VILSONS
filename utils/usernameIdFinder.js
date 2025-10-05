const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const usernameIdFinder = async (relation, username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { [relation]: true }, 
  });

  if (!user || !user[relation]) {
    throw new Error(`${relation} for username "${username}" not found`);
  }

  return user[relation].id;
};

module.exports = usernameIdFinder;

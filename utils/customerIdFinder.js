const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const customerIdFinder = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { customer: true },
  });

  if (!user || !user.customer) {
    throw new Error(`Customer for username "${username}" not found`);
  }

  return user.customer.id;
};

module.exports = customerIdFinder;

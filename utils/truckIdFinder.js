const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const truckIdFinder = async (plate) => {
  const truck = await prisma.truck.findUnique({ where: { plate } });
  if (!truck) throw new Error(`Truck "${plate}" not found`);
  return truck.id;
};


module.exports = truckIdFinder;
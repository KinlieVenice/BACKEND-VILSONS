const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const roleIdFinder = async (roleName) => {
  const role = await prisma.role.findUnique({ where: { roleName } });
  if (!role) throw new Error(`Role "${roleName}" not found`);
  return role.id;
};

const permissionIdFinder = async (permissionName) => {
  const permission = await prisma.permission.findUnique({ where: { permissionName } });
  if (!permission) throw new Error(`Role "${permissionName}" not found`);
  return permission.id;
};

const customerIdFinder = async (username) => {
  const user = await prisma.user.findUnique({ where: { username }, include: { customer: true },});
  if (!user || !user.customer) throw new Error(`Customer for username "${username}" not found`);

  return user.customer.id;
};

const branchIdFinder = async (branchName) => {
  const branch = await prisma.branch.findUnique({ where: { branchName } });
  if (!branch) throw new Error(`Branch "${branchName}" not found`);
  return branch.id;
};

const truckIdFinder = async (plate) => {
  const truck = await prisma.truck.findUnique({ where: { plate } });
  if (!truck) throw new Error(`Truck "${plate}" not found`);
  return truck.id;
};


module.exports = {
  roleIdFinder,
  permissionIdFinder,
  customerIdFinder,
  branchIdFinder,
  truckIdFinder,
};
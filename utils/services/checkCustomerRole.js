// utils/checkCustomerRole.js
const getMainBaseRole = require("./getMainBaseRole.js");

const checkCustomerRole = async (prisma, roles) => {
  if (!roles || roles.length === 0) return false;

  // Get base roles (main base role names)
  const baseRoles = await Promise.all(
    roles.map((rId) => getMainBaseRole(prisma, rId))
  );

  // Get actual role names
  const roleDetails = await prisma.role.findMany({
    where: { id: { in: roles } },
    select: { roleName: true },
  });

  const roleNames = roleDetails.map((r) => r.roleName.toLowerCase());

  // Check if any role or base role is "customer"
  const hasCustomerRole =
    baseRoles.includes("customer") || roleNames.includes("customer");

  return hasCustomerRole;
};

module.exports = checkCustomerRole;

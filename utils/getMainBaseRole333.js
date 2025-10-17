// utils/getMainBaseRole.js

/**
 * Recursively finds the main/base role (admin, customer, employee, contractor)
 * for a given roleId, with circular dependency protection.
 *
 * @param {Object} prismaOrTx - Prisma client or transaction instance
 * @param {String} roleId - The role ID to trace up
 * @param {Set} visited - (optional) Set of visited role IDs to detect circular references
 * @returns {Promise<String|null>} - Returns the base role name or null if not found
 * @throws {Error} - Throws an error if a circular reference is detected
 */
const getMainBaseRole = async (prismaOrTx, roleId, visited = new Set()) => {
  // Detect circular reference
  if (visited.has(roleId)) {
    throw new Error(
      "Invalid role setup detected: roles cannot be linked in a loop. Please check your role hierarchy."
    );
  }

  visited.add(roleId);

  const role = await prismaOrTx.role.findUnique({
    where: { id: roleId },
    select: { roleName: true, baseRoleId: true },
  });

  if (!role) return null;

  const baseRoles = ["admin", "customer", "employee", "contractor"];

  // Base role found
  if (baseRoles.includes(role.roleName)) return role.roleName;

  // Recurse upward if a baseRoleId exists
  if (role.baseRoleId)
    return getMainBaseRole(prismaOrTx, role.baseRoleId, visited);

  return null;
};

module.exports =  getMainBaseRole;

/** 
// utils/getMainBaseRole.js


 * Recursively finds the main/base role (admin, customer, employee, contractor)
 * for a given roleId.
 *
 * @param {Object} prismaOrTx - Prisma client or transaction instance
 * @param {String|Number} roleId - The role ID to trace up
 * @returns {Promise<String|null>} - Returns the base role name or null if not found
 */
/**
const getMainBaseRole = async (prismaOrTx, roleId) => {
  const role = await prismaOrTx.role.findUnique({
    where: { id: roleId },
    select: { roleName: true, baseRoleId: true },
  });

  if (!role) return null;

  // Direct main/base roles
  const baseRoles = ["admin", "customer", "employee", "contractor"];
  if (baseRoles.includes(role.roleName)) return role.roleName;

  // Recurse upward if has baseRoleId
  if (role.baseRoleId) return getMainBaseRole(prismaOrTx, role.baseRoleId);

  return null;
};

export default getMainBaseRole;
*/

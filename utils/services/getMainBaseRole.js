const ROLES_LIST = require("../../constants/ROLES_LIST");


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
  // 🧱 If no roleId provided, nothing to trace
  if (!roleId) return null;

  // 🚫 Detect circular reference
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

  // ❌ Role not found in DB
  if (!role) return null;

  const baseRoles = [ROLES_LIST.ADMIN, ROLES_LIST.CUSTOMER, ROLES_LIST.EMPLOYEE, ROLES_LIST.CONTRACTOR];

  // ✅ If this role is a base role, return its name
  if (baseRoles.includes(role.roleName)) return role.roleName;

  // 🔁 Otherwise, climb up the chain if it has a parent
  if (role.baseRoleId) {
    return getMainBaseRole(prismaOrTx, role.baseRoleId, visited);
  }

  // 🧩 No more parents, and not a base role — stop
  return null;
};

module.exports = getMainBaseRole;

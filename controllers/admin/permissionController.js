const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const createPermission = async (req, res) => {
  const { module, action, method, description } = req.body;

  if (!module || !action || !method || !description)
    return res
      .status(400)
      .json({
        message: "Module, action, method, description are required",
      });

  try {
    const result = await prisma.permission.create({
      data: {
        module,
        action,
        method,
        description,
      },
    });

    return res.status(201).json({
      message: "Permission created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const userId = req.id; 

    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithPermissions) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract and flatten permissions
    const permissions = userWithPermissions.roles.flatMap((userRole) =>
      userRole.role.permissions.map((rolePermission) => ({
        id: rolePermission.permission.id,
        permissionName: rolePermission.permission.permissionName,
        module: rolePermission.permission.module,
        method: rolePermission.permission.method,
        description: rolePermission.permission.description,
        approval: rolePermission.approval,
      }))
    );

    // Remove duplicates by permission ID
    const uniquePermissions = Array.from(
      new Map(permissions.map((p) => [p.id, p])).values()
    );

    res.json({
      permissions: uniquePermissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user permissions" });
  }
};
module.exports = { createPermission, getUserPermissions };

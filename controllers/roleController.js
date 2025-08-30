const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const createRole = async (req, res) => {
  const { roleName, baseRole, isCustom } = req.body;

  if (!roleName)
    return res.status(400).json({ message: "roleName is required" });

  const duplicate = await prisma.role.findFirst({
    where: { roleName },
  });

  if (duplicate) return res.status(400).json({ message: "Role already exists"})

  try {
    const result = await prisma.role.create({
      data: {
        roleName,
        baseRole,
        isCustom,
      },
    });

    return res.status(201).json({
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createRole };

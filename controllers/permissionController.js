const { PrismaClient } = require("../generated/prisma");
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

module.exports = { createPermission };

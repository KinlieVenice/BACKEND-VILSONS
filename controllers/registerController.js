const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  const { name, username, phone, email, password, description, approvalStatus } = req.body;

  if (!name || !username || !password || !email) {
    return res.status(400).json({
      message: "Name, username, email and password are required",
    });
  }

  const duplicate = await prisma.userVersion.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (duplicate) {
    let message = [];
    if (duplicate.username === username) message.push("Username");
    if (duplicate.email === email) message.push("Email");

    return res
      .status(400)
      .json({ error: `${message.join(" and ")} already exist` });
  }

  try {
    const hashPwd = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {},
      });

      const userVersion = await tx.userVersion.create({
        data: {
          userId: user.id,
          approvalStatus,
          name,
          username,
          phone: "null",
          email,
          hashPwd,
          description: "null",
        },
      });

      return { user, userVersion };
    });

    return res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports = { createUser };

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  const {
    name,
    username,
    phone,
    email,
    password,
    description,
    approvalStatus,
  } = req.body;

  if (!name || !username || !password || !email) {
    return res.status(400).json({
      message: "Name, username, email and password are required",
    });
  }

  const duplicate = await prisma.user.findFirst({
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
        data: {
          approvalStatus,
          name,
          username,
          ...(phone ? { phone } : {}),
          email,
          hashPwd,
          ...(description ? { description } : {}),
        },
      });

      return { user };
    });

    return res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({
      message: "ID is required",
    });

  const user = await user.findFirst({ id: req.body.id });
  if (!user)
    res.status(400).json({ message: `User with ${req.body.id} doesn't exist` });

  const result = await prisma.$transaction(async (tx) => {
    const user_edit = await tx.userEdit.create({
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(hashPwd !== undefined ? { hashPwd } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(requestType !== undefined ? { requestType } : {}),
      },
    });
  });
};

module.exports = { createUser };

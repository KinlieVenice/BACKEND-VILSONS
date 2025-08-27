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
          fullName: name,
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
  const {
    fullName,
    username,
    phone,
    email,
    password,
    description,
    approvalStatus,
    requestType,
  } = req.body;

  if (!req?.body?.id || !requestType)
    return res.status(400).json({ message: "ID and requestType are required" });

  const user = await prisma.user.findFirst({ where: { id: req.body.id } });
  if (!user) {
    return res
      .status(400)
      .json({ message: `User with ${req.body.id} doesn't exist` });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedData = {
        fullName: fullName ?? user.fullName,
        phone: phone ?? user.phone,
        email: email ?? user.email,
        hashPwd: password ? await bcrypt.hash(password, 10) : user.hashPwd,
        description: description ?? user.description,
      };

      const user_edit = await tx.userEdit.create({
        data: {
          userId: user.id,
          ...updatedData,
          requestType: requestType ?? user.requestType,
        },
      });

      let user_published;
      if (user_edit.approvalStatus === "published") {
        user_published = await tx.user.update({
          where: { id: user.id }, 
          data: updatedData,
        });
      }
      return { user_edit, user_published };
    });

    return res.status(201).json({
      message: "User edited successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, editUser };

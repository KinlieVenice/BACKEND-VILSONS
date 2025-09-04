const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const roleIdFinder = require("../utils/roleIdFinder");

const createUser = async (req, res) => {
  const { name, username, phone, email, password, description, roles } =
    req.body;

  if (!name || !username || !phone || !password || !email || !roles) {
    return res.status(400).json({
      message: "Name, username, email, password and roles are required",
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
    let message;
    let needsApproval = false;

    const hashPwd = await bcrypt.hash(password, 10);
    const userData = {
      fullName: name,
      username,
      phone,
      email,
      hashPwd,
      ...(description ? { description } : {}),
    };

    const result = await prisma.$transaction(async (tx) => {
      const user = needsApproval
        ? await tx.userEdit.create({
            data: { ...userData, requestType: "create" },
          })
        : await tx.user.create({
            data: { ...userData },
          });

      const userRoleData = await Promise.all(
        roles.map(async (role) => {
          return {
            roleId: await roleIdFinder(role),
            userId: user.id,
          };
        })
      );

      const userRole = needsApproval
        ? await tx.userRole.createMany({
            data: userRoleData,
          })
        : await tx.userRole.createMany({
            data: userRoleData,
          });

      const message = needsApproval
        ? "User created is awaiting approval"
        : "User is successfully created";

      return { user, roles };
    });


    return res.status(201).json({
      message,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  const { fullName, phone, email, description, approvalStatus, requestType } =
    req.body;

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
        // ...(fullName ? { fullName } : {}),
        //...(phone ? { phone } : {}),
        // ...(email ? { email } : {}),
        // ...(password ? { hashPwd: await bcrypt.hash(password, 10) } : {}),
        // ...(description ? { description } : {}),

        fullName: fullName ?? user.fullName,
        phone: phone ?? user.phone,
        email: email ?? user.email,
        hashPwd: user.hashPwd,
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

const editPassword = async (req, res) => {
  const { password } = req.body;

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
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        hashPwd: password ? await bcrypt.hash(password) : user.password,
        description: user.description,
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

const deleteUser = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required" });

  const user = await prisma.user.findFirst({ where: { id: req.body.id } });

  if (!user) {
    return res
      .status(400)
      .json({ message: `User with ${req.body.id} doesn't exist` });
  }

  await prisma.user.delete({ where: { id: req.body.id } });
};

const fetchUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};
module.exports = { createUser, editUser, fetchUsers };

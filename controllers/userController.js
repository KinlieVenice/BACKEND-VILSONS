const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const roleIdFinder = require("../utils/roleIdFinder");

const createUser = async (req, res) => {
  const { name, username, phone, email, password, description, roles } =
    req.body;

  if (!name || !username || !phone || !email || !roles) {
    return res.status(400).json({
      message: "Name, username, email, and roles are required",
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

   const pendingUser = await prisma.userEdit.findFirst({
     where: {
       OR: [{ username }, { email }],
     },
   });

  if (existingUser || pendingUser) {
    let message = [];
    if (
      (existingUser && existingUser.username === username) ||
      (pendingUser && pendingUser.username === username)
    )
      message.push("Username");
    if (
      (existingUser && existingUser.email === email) ||
      (pendingUser && pendingUser.email === email)
    )
      message.push("Email");

    return res
      .status(400)
      .json({ error: `${message.join(" and ")} already exist` });
  }

  try {
    let message;
    let needsApproval = req.approval;
    console.log(needsApproval);

    const hashPwd = await bcrypt.hash(
      password || process.env.DEFAULT_PASSWORD,
      10
    );
    const userData = {
      fullName: name,
      username,
      phone,
      email,
      hashPwd,
      ...(description ? { description } : {}),
      createdByUser: req.username || null,
      updatedByUser: req.username || null,
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
            ...(needsApproval ? { userEditId: user.id } : { userId: user.id }),
          };
        })
      );

      const userRole = needsApproval
        ? await tx.userRoleEdit.createMany({
            data: userRoleData,
          })
        : await tx.userRole.createMany({
            data: userRoleData,
          });

      const message = needsApproval
        ? "User created is awaiting approval"
        : "User is successfully created";

      return { user, roles, message };
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
  const { name, phone, email, description } = req.body;

  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required" });

  const user = await prisma.user.findFirst({ where: { id: req.body.id } });
  if (!user)
    return res
      .status(400)
      .json({ message: `User with ${req.body.id} doesn't exist` });

  try {
    let message;
    let needsApproval = req.approval;
    console.log(needsApproval);

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    const pendingEdit = await prisma.userEdit.findFirst({
      where: {
        email,
        approvalStatus: "pending",
      },
    });

    if (existingUser || pendingEdit) {
      return res
        .status(400)
        .json({ message: "Email already in use or pending approval" });
    }

    const updatedData = {
      // ...(fullName ? { fullName } : {}),
      //...(phone ? { phone } : {}),
      // ...(email ? { email } : {}),
      // ...(password ? { hashPwd: await bcrypt.hash(password, 10) } : {}),
      // ...(description ? { description } : {}),

      fullName: name ?? user.fullName,
      username: user.username,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      hashPwd: user.hashPwd,
      description: description ?? user.description,
      roles: user.roles,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const user_edit = needsApproval
        ? await tx.userEdit.create({
            data: {
              userId: user.id,
              ...updatedData,
              createdByUser: req.username,
              requestType: "edit",
            },
          })
        : await tx.user.update({
            where: { id: req.body.id },
            data: updatedData,
          });

      return { user_edit };
    });

    return res.status(201).json({
      message: "User edited successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const user = await prisma.user.findFirst({ where: { id: req.body.id } });
  if (!user) {
    return res
      .status(400)
      .json({ message: `User with ID ${req.body.id} doesn't exist` });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.hashPwd);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid old password" });
  }

  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  if (!strongPasswordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.",
    });
  }

  const hashPwd = await bcrypt.hash(newPassword, 10);

  const isUnchanged = await bcrypt.compare(oldPassword, hashPwd);
  if (isUnchanged) {
    return res
      .status(400)
      .json({ message: "New and old password cannot be the same" });
  }

  try {
    const needsApproval = req.approval;

    const updatedData = {
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      email: user.email,
      hashPwd,
      description: user.description,
    };

    const result = await prisma.$transaction(async (tx) => {
      const user_edit = needsApproval
        ? await tx.userEdit.create({
            data: {
              userId: user.id,
              ...updatedData,
              requestType: "edit",
            },
          })
        : await tx.user.update({
            where: { id: user.id },
            data: updatedData,
          });

      const message = needsApproval
        ? "User password awaiting approval"
        : "User password successfully changed";

      return { message, hashPwd: updatedData.hashPwd };
    });

    return res.status(201).json({
      message: result.message,
      data: result.hashPwd,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.body.id } });

  if (!user) {
    return res
      .status(404)
      .json({ message: `User with ID ${req.body.id} doesn't exist` });
  }

  if (user.username === "superadmin")
    return res.status(400).json({ message: "Superadmin cannot be deleted" });

  try {
    const needsApproval = req.approval;

    const result = await prisma.$transaction(async (tx) => {
      const user_delete = needsApproval
        ? await tx.userEdit.create({
            data: {
              userId: user.id,
              fullName: user.fullName,
              username: user.username,
              phone: user.phone,
              email: user.email,
              hashPwd: user.hashPwd,
              description: user.description,
              requestType: "delete",
              createdByUser: req.username,
              updatedByUser: req.username,
            },
          })
        : await tx.user.delete({ where: { id: user.id } });

      const message = needsApproval
        ? "Delete is awaiting approval"
        : "User deleted";

      return { user_delete, message };
    });

    return res.status(needsApproval ? 202 : 200).json({
      message: result.message,
      data: result.user_delete,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const role = req?.query?.role;
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);

    let where = {};

    if (role) {
      where.roles = {
        some: {
          role: {
            roleName: role,
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      ...(page && limit ? {skip: (page - 1) * limit} : {}),
      ...(limit ? {take: limit} : {}),
      include: {
        roles: {
          include: {
            role: { select: { roleName: true } },
          },
        },
      },
    });

    const total = await prisma.user.count({ where });

    const formattedUsers = users.map((user) => ({
      ...user,
      roles: user.roles.map((r) => r.role.roleName),
    }));

    res.status(200).json(formattedUsers, total);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

module.exports = {
  createUser,
  editUser,
  getAllUsers,
  editUserPassword,
  deleteUser,
};

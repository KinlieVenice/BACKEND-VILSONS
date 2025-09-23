const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const roleIdFinder = require("../utils/roleIdFinder");
const branchIdFinder = require("../utils/branchIdFinder");

const createUser = async (req, res) => {
  const {
    name,
    username,
    phone,
    email,
    password,
    description,
    roles,
    branches,
  } = req.body;

  if (!name || !username || !phone || !email || !roles || !branches) {
    return res.status(400).json({
      message: "Name, username, email, phone, branches, and roles are required",
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

      //this is an object with function as value
      if (!needsApproval) {
        const roleTableMap = {
          admin: () => tx.admin.create({ data: { userId: user.id } }),
          customer: () => tx.customer.create({ data: { userId: user.id } }),
          employee: () => tx.employee.create({ data: { userId: user.id } }),
          contractor: () =>
            tx.contractor.create({
              data: {
                userId: user.id,
                commission: req.body.commission,
              },
            }),
        };

        await Promise.all(
          roles
            .filter((role) => roleTableMap[role])
            .map((role) => roleTableMap[role]()) // call value function
        );
      }

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

      const userBranchData = await Promise.all(
        branches.map(async (branch) => {
          return {
            branchId: await branchIdFinder(branch),
            ...(needsApproval ? { userEditId: user.id } : { userId: user.id }),
          };
        })
      );

       const userBranch = needsApproval
         ? await tx.userBranchEdit.createMany({
             data: userBranchData,
           })
         : await tx.userBranch.createMany({
             data: userBranchData,
           });

      message = needsApproval
        ? "User created is awaiting approval"
        : "User is successfully created";

      return { user, roles, branches };
    });

    return res.status(201).json({
      message,
      data: {
        ...result.user,
        roles: result.roles,
        branches: result.branches
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  const { name, phone, email, description, roles } = req.body;

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
    let existingUser;
    let pendingUser;
    console.log(needsApproval);

    if (email && email !== user.email) {
      existingUser = await prisma.user.findFirst({
        where: { email },
      });
      pendingUser = await prisma.userEdit.findFirst({
        where: {
          email,
          approvalStatus: "pending",
        },
      });
    }

    if (existingUser || pendingUser) {
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

      const arraysEqual = (a, b) =>
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        [...a].sort().join(",") === [...b].sort().join(",");

      if (!needsApproval && !arraysEqual(user.roles, roles)) {
        // STEP 1: Reset junction table roles
        await tx.userRole.deleteMany({ where: { userId: user.id } });

        await tx.userRole.createMany({
          data: await Promise.all(
            roles.map(async (role) => ({
              userId: user.id,
              roleId: await roleIdFinder(role),
            }))
          ),
        });

        // STEP 2: Clear old role-specific tables
        await Promise.all([
          tx.admin.deleteMany({ where: { userId: user.id } }),
          tx.customer.deleteMany({ where: { userId: user.id } }),
          tx.employee.deleteMany({ where: { userId: user.id } }),
          tx.contractor.deleteMany({ where: { userId: user.id } }),
        ]);

        // STEP 3: Recreate based on new roles
        const roleTableMap = {
          admin: () => tx.admin.create({ data: { userId: user.id } }),
          customer: () => tx.customer.create({ data: { userId: user.id } }),
          employee: () => tx.employee.create({ data: { userId: user.id } }),
          contractor: () =>
            tx.contractor.create({
              data: {
                userId: user.id,
                commission: req.body.commission,
              },
            }),
        };

        await Promise.all(
          roles
            .filter((role) => roleTableMap[role])
            .map((role) => roleTableMap[role]())
        );
      }

      message = needsApproval
        ? "User edit awaiting approval"
        : "User edited successfully";

      return { user_edit };
    });

    return res.status(201).json({
      message,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProfile = async (req, res) => {
  const { name, phone, email, description } = req.body;

  try {
    let message;
    let existingUser;
    let pendingUser;

    const user = await prisma.user.findFirst({ where: { id: req.id } });

    if (email && email !== user.email) {
      existingUser = await prisma.user.findFirst({
        where: { email },
      });
      pendingUser = await prisma.userEdit.findFirst({
        where: {
          email,
          approvalStatus: "pending",
        },
      });
    }

    if (existingUser || pendingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use or pending approval" });
    }

    const updatedData = {
      fullName: name ?? user.fullName,
      username: user.username,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      hashPwd: user.hashPwd,
      description: description ?? user.description,
      updatedByUser: req.username,
    };

    const result = await prisma.$transaction(async (tx) => {
      const user_edit = await tx.user.update({
        where: { id: user.id },
        data: updatedData,
      });

      message = "User edited successfully";

      return user_edit;
    });

    return res.status(201).json({
      message,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProfilePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await prisma.user.findFirst({ where: { id: req.id } });

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
    const updatedData = {
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      email: user.email,
      hashPwd,
      description: user.description,
    };

    const result = await prisma.$transaction(async (tx) => {
      const user_edit = await tx.user.update({
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
    const startDate = req?.query?.startDate; // e.g. "2025-01-01"
    const endDate = req?.query?.endDate; // e.g. "2025-01-31"

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

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const users = await prisma.user.findMany({
      where,
      ...(page && limit ? { skip: (page - 1) * limit } : {}),
      ...(limit ? { take: limit } : {}),
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

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        roles: {
          include: {
            role: { select: { roleName: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Destructure user to separate roles
    const { roles, ...userWithoutRoles } = user;

    const formattedRoles = roles.map((r) => r.role.roleName);

    const formattedUser = {
      ...userWithoutRoles,
      roles: formattedRoles,
    };

    return res.status(200).json(formattedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser,
  editUser,
  editProfile,
  editProfilePassword,
  getAllUsers,
  editUserPassword,
  deleteUser,
  getUser,
};

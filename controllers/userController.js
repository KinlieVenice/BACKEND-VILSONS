const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const relationsChecker = require("../utils/relationsChecker");
const { getDateRangeFilter } = require("../utils/dateRangeFilter");
const getMainBaseRole = require("../utils/getMainBaseRole.js");
const { requestApproval } = require("../services/approvalService")


const createUserOLD = async (req, res) => {
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
    let needsApproval = req.approval;
    let  message = needsApproval
        ? "User created is awaiting approval"
        : "User is successfully created";
        
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
            data: { ...userData, status: "active", },
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

        // Fetch role names for all roleIds in one go
        const roleRecords = await tx.role.findMany({
          where: { id: { in: roles } },
          select: { roleName: true },
        });

        // Extract just the role names
        const roleNames = roleRecords.map((r) => r.roleName);

        // Run mapped role table functions
        await Promise.all(
          roleNames
            .filter((roleName) => roleTableMap[roleName]) // keep only valid roles
            .map((roleName) => roleTableMap[roleName]())  // call value function
        );
      }

      const userRoleData = await Promise.all(
        roles.map(async (role) => {
          return {
            roleId: role,
            userId: user.id,
          };
        })
      );

      const userRole = needsApproval
        ? {}
        : await tx.userRole.createMany({
            data: userRoleData,
          });

      const userBranchData = await Promise.all(
        branches.map(async (branch) => {
          return {
            branchId: branch,
            userId: user.id,
          };
        })
      );

      const userBranch = needsApproval
        ? {}
        : await tx.userBranch.createMany({
            data: userBranchData,
          });
      
      const userDetails = await tx.user.findFirst({
        where: { id: user.id },
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
        }
      });

      return { userDetails };
    });

    const { hashPwd: _, refreshToken, ...safeUser } = result.userDetails;

    return res.status(201).json({
      message,
      data: {
        ...safeUser,
        // ...(({ hashPwd, refreshToken, ...safeUser }) => safeUser)(result.editedUser),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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
    where: { OR: [{ username }, { email }] },
  });

  const pendingUser = await prisma.approvalLog.findFirst({
    where: {
      status: "pending",
      OR: [
        { payload: { path: "$.username", equals: username } },
        { payload: { path: "$.email", equals: email } },
      ],
    },
  });

  if (existingUser || pendingUser) {
    const pendingUsername = pendingUser?.payload?.username;
    const pendingEmail = pendingUser?.payload?.email;

    let message = [];
    if (
      (existingUser && existingUser.username === username) ||
      (pendingUsername && pendingUsername === username)
    )
      message.push("Username");
    if (
      (existingUser && existingUser.email === email) ||
      (pendingEmail && pendingEmail === email)
    )
      message.push("Email");

    return res
      .status(400)
      .json({ error: `${message.join(" and ")} already exist` });
  }

  try {
    const needsApproval = true;
    const message = needsApproval
      ? "User created is awaiting approval"
      : "User is successfully created";

    const hashPwd = await bcrypt.hash(password || process.env.DEFAULT_PASSWORD, 10);
    const userData = {
      fullName: name,
      username,
      phone,
      email,
      hashPwd,
      ...(description ? { description } : {}),
      createdByUser: req.username || null,
      updatedByUser: req.username || null,
      ...(needsApproval ? { roles, branches } : {}),
    };

    const result = await prisma.$transaction(async (tx) => {
      const user = needsApproval
        ? await requestApproval('user', null, 'create', userData, req.username)
        : await tx.user.create({ data: { ...userData, status: "active" } });

      if (!needsApproval) {
        const roleTableMap = {
          admin: () => tx.admin.create({ data: { userId: user.id } }),
          customer: () => tx.customer.create({ data: { userId: user.id } }),
          employee: () => tx.employee.create({ data: { userId: user.id } }),
          contractor: () => tx.contractor.create({ data: { userId: user.id, commission: req.body.commission } }),
        };

        // Fetch role IDs for this user
        const roleNamesToCreateTables = await Promise.all(
          roles.map((rId) => getMainBaseRole(tx, rId))
        );

        // Remove duplicates and nulls
        const uniqueRoleNames = [...new Set(roleNamesToCreateTables.filter(Boolean))];

        // Create tables for main roles
        await Promise.all(uniqueRoleNames.map((roleName) => roleTableMap[roleName]()));
      }

      // userRole table
      const userRoleData = roles.map((role) => ({ roleId: role, userId: user.id }));
      if (!needsApproval) await tx.userRole.createMany({ data: userRoleData });

      // userBranch table
      const userBranchData = branches.map((branch) => ({ branchId: branch, userId: user.id }));
      if (!needsApproval) await tx.userBranch.createMany({ data: userBranchData });

      const userDetails = await tx.user.findFirst({
        where: { id: user.id },
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
        },
      });

      return { user, userDetails } ;
    });

    let safeUser;
    if (!needsApproval) {
      const { hashPwd: _, refreshToken, ...rest } = result.userDetails;
      safeUser = rest;
    }

    return res.status(201).json({
      message,
      data: needsApproval ? result.user : safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// apply in edit too if role is changed

const editUserOld = async (req, res) => {
  const { name, phone, email, description, roles, branches } = req.body;

  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  const user = await prisma.user.findFirst({ where: { id: req.params.id } });
  if (!user)
    return res
      .status(400)
      .json({ message: `User with ${req.params.id} doesn't exist` });

  try {
    let needsApproval = req.approval;
    let message = needsApproval
        ? "User edit awaiting approval"
        : "User edited successfully";
    let existingUser;
    let pendingUser;

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
      const editedUser = needsApproval
        ? await tx.userEdit.create({
            data: {
              userId: user.id,
              ...updatedData,
              createdByUser: req.username,
              requestType: "edit",
            },
          })
        : await tx.user.update({
            where: { id: user.id },
            data: updatedData,
          });

      const arraysEqual = (a, b) =>
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        [...a].sort().join(",") === [...b].sort().join(",");

      if (!needsApproval && roles && !arraysEqual(user.roles, roles)) {
        // STEP 1: Reset junction table roles
        await tx.userRole.deleteMany({ where: { userId: user.id } });

        await tx.userRole.createMany({
          data: await Promise.all(
            roles.map(async (role) => ({
              userId: user.id,
              roleId: role,
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

        const roleRecords = await tx.role.findMany({
          where: { id: { in: roles } },
          select: { roleName: true },
        });

        // Extract just the role names
        const roleNames = roleRecords.map((r) => r.roleName);

        // Run mapped role table functions
        await Promise.all(
          roleNames
            .filter((roleName) => roleTableMap[roleName]) // keep only valid roles
            .map((roleName) => roleTableMap[roleName]())  // call value function
        );
      }

      if (!needsApproval && branches && !arraysEqual(user.branches, branches)) {
        await tx.userBranch.deleteMany({ where: { userId: user.id } });

        await tx.userBranch.createMany({
          data: await Promise.all(
            branches.map(async (branch) => ({
              userId: user.id,
              branchId: branch,
            }))
          ),
        });
      }

      const userDetails = await tx.user.findFirst({
        where: { id: editedUser.id },
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
        }
      });

      return { userDetails };
    });

    const { hashPwd: _, refreshToken, ...safeUser } = result.userDetails;

    return res.status(201).json({
      message,
      data: {
        ...safeUser,
        // ...(({ hashPwd, refreshToken, ...safeUser }) => safeUser)(result.editedUser),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  const { name, phone, email, description, roles, branches } = req.body;

  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  const user = await prisma.user.findFirst({ where: { id: req.params.id } });
  if (!user)
    return res
      .status(400)
      .json({ message: `User with ${req.params.id} doesn't exist` });

  try {
    let needsApproval = true;
    let message = needsApproval
        ? "User edit awaiting approval"
        : "User edited successfully";

    let existingUser;
    let pendingUser;

    if (email && email !== user.email) {
      existingUser = await prisma.user.findFirst({ where: { email } });
      pendingUser = await prisma.approvalLog.findFirst({
        where: {
          status: "pending",
          OR: [
            { payload: { path: "$.email", equals: email } },
        ],
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
      ...(needsApproval ? { roles, branches } : {}),
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedUser = needsApproval
        ? await requestApproval('user', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
        : await tx.user.update({
            where: { id: user.id },
            data: updatedData,
          });

      const arraysEqual = (a, b) =>
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        [...a].sort().join(",") === [...b].sort().join(",");

      if (!needsApproval && roles && !arraysEqual(user.roles, roles)) {
        // STEP 1: Reset junction table roles
        await tx.userRole.deleteMany({ where: { userId: user.id } });

        await tx.userRole.createMany({
          data: roles.map((role) => ({ userId: user.id, roleId: role })),
        });

        // STEP 2: Clear old role-specific tables
        await Promise.all([
          tx.admin.deleteMany({ where: { userId: user.id } }),
          tx.customer.deleteMany({ where: { userId: user.id } }),
          tx.employee.deleteMany({ where: { userId: user.id } }),
          tx.contractor.deleteMany({ where: { userId: user.id } }),
        ]);

        // STEP 3: Recreate tables based on main roles (recursive)
        const roleTableMap = {
          admin: () => tx.admin.create({ data: { userId: user.id } }),
          customer: () => tx.customer.create({ data: { userId: user.id } }),
          employee: () => tx.employee.create({ data: { userId: user.id } }),
          contractor: () =>
            tx.contractor.create({ data: { userId: user.id, commission: req.body.commission } }),
        };

        // Determine main roles from roleIds recursively
        const roleNamesToCreateTables = await Promise.all(
          roles.map((roleId) => getMainBaseRole(prisma, roleId))
        );

        const uniqueRoleNames = [...new Set(roleNamesToCreateTables)].filter(Boolean);

        // Run mapped role table functions for main roles
        await Promise.all(
          uniqueRoleNames
            .filter((roleName) => roleTableMap[roleName])
            .map((roleName) => roleTableMap[roleName]())
        );
      }

      // STEP 4: Update branches if changed
      if (!needsApproval && branches && !arraysEqual(user.branches, branches)) {
        await tx.userBranch.deleteMany({ where: { userId: user.id } });
        await tx.userBranch.createMany({
          data: branches.map((branch) => ({ userId: user.id, branchId: branch })),
        });
      }

      const userDetails = await tx.user.findFirst({
        where: { id: editedUser.id },
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
        },
      });

      return { userDetails, user };
    });

    let safeUser;
    if (!needsApproval) {
      const { hashPwd: _, refreshToken, ...rest } = result.userDetails;
      safeUser = rest;
    }

    return res.status(201).json({
      message,
      data: needsApproval ? result.user : safeUser,
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
      const editedProfile = await tx.user.update({
        where: { id: user.id },
        data: updatedData,
      });

      message = "Profile edited successfully";

      return editedProfile;
    });

    return res.status(201).json({
      message,
      data: {
        ...(({ id, hashPwd, refreshToken, ...safeUser }) => safeUser)(result),
      },
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
    let message = "Profile password successfully changed";
    const updatedData = {
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      email: user.email,
      hashPwd,
      description: user.description,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedProfilePassword = await tx.user.update({
        where: { id: user.id },
        data: updatedData,
      });
    });

    return res.status(201).json({
      message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const user = await prisma.user.findFirst({ where: { id: req.params.id } });
  if (!user) {
    return res
      .status(400)
      .json({ message: `User with ID ${req.params.id} doesn't exist` });
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
    let message;

    const updatedData = {
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      email: user.email,
      hashPwd,
      description: user.description,
    };

    const result = await prisma.$transaction(async (tx) => {
      const editedUserPassword = needsApproval
        ? await requestApproval('user', req.params.id, 'edit', {
              ...updatedData,
              createdByUser: req.username }, req.username)
        : await tx.user.update({
            where: { id: user.id },
            data: updatedData,
          });

      message = needsApproval
        ? "User password awaiting approval"
        : "User password successfully changed";
    });

    return res.status(201).json({
      message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUserSS = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return res
      .status(404)
      .json({ message: `User with ID ${req.params.id} doesn't exist` });
  }

  if (user.username === "superadmin")
    return res.status(400).json({ message: "Superadmin cannot be deleted" });
  if (user.username === req.username)
    return res.status(400).json({ message: "Self cannot be deleted" });

  try {
    const needsApproval = req.approval;
    let message;

    const result = await prisma.$transaction(async (tx) => {
      const deletedUser = needsApproval
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

      message = needsApproval ? "Delete is awaiting approval" : "User deleted";

      return { deletedUser };
    });

    return res.status(201).json({
      message,
      username: result.deletedUser.username,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const needsApproval = true;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        admin: true,
        customer: {
          include: {
            trucks: true,
            trucksEdit: true,
            jobOrder: true,
            jobOrderEdit: true,
          },
        },
        contractor: {
          include: {
            contractorPay: true,
            contractorPayEdit: true,
            JobOrder: true,
            JobOrderEdit: true,
          },
        },
        employee: {
          include: {
            employeeSalary: true,
            employeePay: true
          },
        },

        // exclude these from relation checking
        roles: true,
        rolesEdit: true,
        branches: true,
        branchesEdit: true,

        // keep all other created/updated relations
        activityLog: true,
        createdUsers: true,
        updatedUsers: true,
        createdUserEdit: true,
        createdRole: true,
        createdBranches: true,
        createdBranchEdit: true,
        createdTrucks: true,
        createdTruckEdit: true,
        createdTransaction: true,
        createdJobOrder: true,
        createdJobOrderEdit: true,
        createdContractorPay: true,
        createdContractorPayEdit: true,
        createdEmployeeSalary: true,
        createdEmployeeSalaryEdit: true,
        createdEquipment: true,
        createdEquipmentEdit: true,
        createdOtherIncome: true,
        createdOtherIncomeEdit: true,
        createdOverhead: true,
        createdOverheadEdit: true,
        transferredTruckOwnership: true,
        transferredTruckOwnershipEdit: true,
        updatedUserEdits: true,
        updatedBranches: true,
        updatedBranchEdits: true,
        updatedTruck: true,
        updatedTruckEdit: true,
        updatedTransaction: true,
        updatedJobOrder: true,
        updatedJobOrderEdit: true,
        updatedContractorPay: true,
        updatedContractorPayEdit: true,
        updatedEmployeeSalary: true,
        updatedEmployeeSalaryEdit: true,
        updatedEquipment: true,
        updatedEquipmentEdit: true,
        updatedOtherIncome: true,
        updatedOtherIncomeEdit: true,
        updatedOverhead: true,
        updatedOverheadEdit: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Check relations, but ignore roles/branches/edits
    const excludedKeys = ["roles", "rolesEdit", "branches", "branchesEdit", "edits"];
    const hasRelations = relationsChecker(user, excludedKeys);
    console.log(hasRelations)

    let message = hasRelations ? "User marked as inactive (has related records)" : "User and related roles/branches/edits deleted successfully"

    await prisma.$transaction(async (tx) => {

      if (needsApproval) {
        const approval = await requestApproval(
          "user",           // table name
          user.id,           // record id
          "delete",          // action type
          user,              // payload (snapshot of data)
          req.username        // requested by
        );

        return res.status(200).json({
          message: "User deletion pending approval",
          approvalId: approval.id, // include approval log ID here
        });
      }

      if (hasRelations) {
        await tx.user.update({
          where: { id: user.id },
          data: { status: "inactive", refreshToken: null, },
        });
      } else {
        // delete excluded relations first
        await tx.userRole.deleteMany({ where: { userId: user.id } });
        await tx.userRoleEdit.deleteMany({ where: { userId: user.id } });
        await tx.userBranch.deleteMany({ where: { userId: user.id } });
        await tx.userBranchEdit.deleteMany({ where: { userId: user.id } });
        await tx.userEdit.deleteMany({ where: { userId: user.id } });

        await tx.customer.deleteMany({ where: { userId: user.id } });
        await tx.employee.deleteMany({ where: { userId: user.id } });
        await tx.contractor.deleteMany({ where: { userId: user.id } });
        await tx.admin.deleteMany({ where: { userId: user.id } });

        await tx.userEdit.deleteMany({ where: { userId: user.id } });

        // finally delete the user
        await tx.user.delete({ where: { id: user.id } });
      }
    })
    

    return res.status(200).json({ message });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//only view own branches
const getAllUsers = async (req, res) => {
  try {
    const role = req?.query?.role;
    const branch = req?.query?.branch;
    const search = req?.query?.search;
    const page = req?.query?.page && parseInt(req.query.page, 10);
    const limit = req?.query?.limit && parseInt(req.query.limit, 10);
    const startDate = req?.query?.startDate;
    const endDate = req?.query?.endDate;
    let totalItems = 0;
    let totalPages = 1;

    let where = { status: "active" };

    const createdAtFilter = getDateRangeFilter(startDate, endDate);
    if (createdAtFilter) {
      where.createdAt = createdAtFilter;
    }

    //  Filter by role
    if (role) {
      where.roles = {
        some: {
          roleId: role, // since UserRole has roleId
        },
      };
    }

    if (branch) {
      let branchValue = req.query.branch.trim().replace(/^["']|["']$/g, "");
      where.branches = {
        some: {
          branch: {
            branchId: branchValue,
          },
        },
      };
    } else if (req.branchIds?.length) {
      where.branches = {
        some: {
          branchId: { in: req.branchIds },
        },
      };
    };

    //  Search filter
    if (search) {
      let searchValue = req.query.search.trim().replace(/^["']|["']$/g, "");

      where.OR = [
        { fullName: { contains: searchValue } },
        { username: { contains: searchValue } },
      ];
    }

    //  Query and pagination
    const result = await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where,
        ...(page && limit ? { skip: (page - 1) * limit } : {}),
        ...(limit ? { take: limit } : {}),
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
        },
      });

      totalItems = await tx.user.count({ where });
      if (limit) totalPages = Math.ceil(totalItems / limit);

      // Exclude sensitive fields
      const formattedUsers = users.map((user) => {
        const { hashPwd, refreshToken, roles, branches, ...safeUser } = user;

        return {
          ...safeUser,
          roles: roles.map((r) => ({
            id: r.role.id,
            roleName: r.role.roleName,
          })),
          branches: branches.map((b) => ({
            id: b.branch.id,
            branchName: b.branch.branchName,
          })),
        };
      });

      return { users: formattedUsers };
    });

    res.status(200).json({
      data: { ...result, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID is required" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        roles: { include: { role: true } },
        branches: { include: { branch: true } },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { hashPwd, refreshToken, roles, branches, ...safeUser } = user;

    return res.status(200).json({
      data: {
        ...safeUser,
        roles: roles.map((r) => ({
          id: r.role.id,
          roleName: r.role.roleName,
        })),
        branches: branches.map((b) => ({
          id: b.branch.id,
          branchName: b.branch.branchName,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      include: {
        roles: { select: { role: { select: { id: true, roleName: true } } } },
        branches: { select: { branch: { select: { id: true, branchName: true } } } },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.role),
      branches: user.branches.map(b => b.branch),
    };

    const { hashPwd, refreshToken, ...safeUser } = transformedUser;

    res.status(200).json({
      data: {
        ...safeUser,
        // roles: roles.map((r) => r.role.roleName),
        // branches: branches.map((b) => b.branch.branchName),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  getMyProfile
};

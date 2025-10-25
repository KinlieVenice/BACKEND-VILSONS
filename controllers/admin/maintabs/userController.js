const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { getDateRangeFilter } = require("../../../utils/filters/dateRangeFilter");
const getMainBaseRole = require("../../../utils/services/getMainBaseRole.js");
const checkCustomerRole = require("../../../utils/services/checkCustomerRole.js");
const parseArrayFields = require("../../../utils/services/parseArrayFields.js");
const deleteFile = require("../../../utils/services/imageDeleter.js");
const { requestApproval } = require("../../../utils/services/approvalService");
const { branchFilter } = require("../../../utils/filters/branchFilter");
const checkPendingApproval = require("../../../utils/services/checkPendingApproval")
const relationsChecker = require("../../../utils/services/relationsChecker");



// GET /
const createUser = async (req, res) => {
  const parsedBody = parseArrayFields(req.body, ["roles", "branches"]);
  const {
    name,
    username,
    phone,
    email,
    password,
    description,
    roles,
    branches,
  } = parsedBody;
  const image = req.file ? req.file.filename : null;

  if (!name || !username || !phone || !roles) {
    return res.status(400).json({
      message: "Name, username, email, phone, branches, and roles are required",
    });
  }

  const hasCustomerRole = await checkCustomerRole(prisma, roles);

  if (!hasCustomerRole && (!branches || branches.length === 0)) {
    return res
      .status(400)
      .json({ message: "Branches are required for non-customer users" });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      status: "active",
      OR: [
        { username },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  const pendingUsername = await checkPendingApproval(prisma, 'user', ['username'], username);
  const pendingEmail = await checkPendingApproval(prisma, 'user', ['email'], email);

  if (existingUser || pendingUsername || pendingEmail) {
    let message = [];
    if (
      (existingUser && existingUser.username === username) ||
      (pendingUsername && pendingUsername.value === username)
    )
      message.push("Username");
    if (
      (existingUser && existingUser.email === email) ||
      (pendingEmail && pendingEmail.value === email)
    )
      message.push("Email");

    return res
      .status(400)
      .json({ message: `${message.join(" and ")} already exist` });
  }

  try {
    const needsApproval = req.approval;
    const message = needsApproval
      ? "User created is awaiting approval"
      : "User is successfully created";

    const hashPwd = await bcrypt.hash(password || process.env.DEFAULT_PASSWORD, 10);
    const userData = {
      fullName: name,
      username,
      phone: phone.toString(),
      ...(email ? { email } : {}),
      hashPwd,
      ...(description ? { description } : {}),
      createdByUser: req.username || null,
      updatedByUser: req.username || null,
      ...(needsApproval ? { roles, branches } : {}),
      image
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
      const userBranchData =
        branches?.length > 0
          ? branches.map((branch) => ({ branchId: branch, userId: user.id }))
          : [];

      if (!needsApproval && userBranchData.length > 0) {
        await tx.userBranch.createMany({ data: userBranchData });
      }

      const userDetails = await tx.user.findFirst({
        where: { id: user.id },
      });

      return { user, userDetails } ;
    });

    return res.status(201).json({
      message,
      data: needsApproval ? { approvalId: result.user.id, username: result.user.payload.username, fullName: result.user.payload.fullName } : { userId: result.userDetails.id, username: result.userDetails.username,  fullName: result.userDetails.fullName } ,
    });
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ error: err.message });
  }
};

// PUT /:id
const editUser = async (req, res) => {
  const parsedBody = parseArrayFields(req.body, ["roles", "branches"]);
  const { name, phone, email, description, roles, branches } = parsedBody;
  const newImage = req.file ? req.file.filename : null;

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
    
    if (roles) {
      const hasCustomerRole = await checkCustomerRole(prisma, roles);

      if (!hasCustomerRole && (!branches || branches.length === 0)) {
        return res
          .status(400)
          .json({ message: "Branches are required for non-customer users" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findFirst({ where: { email, status:  "active", id: { not: req.params.id } } });
      const pendingUser = await checkPendingApproval(prisma, 'user', ['email'], email, req.params.id);
      const pendingJobOrderUser = await checkPendingApproval(prisma, 'jobOrder', ['customerData', 'email'], email, req.params.id);

      if (existingUser || pendingUser || pendingJobOrderUser) {
      return res
        .status(400)
        .json({ message: "Email already in use or pending approval" });
      }
    }

    let image = user.image;

    if (newImage) {
      if (user.image) {
        deleteFile(`images/users/${user.image}`);
      }
      image = newImage;
    }
    // If frontend sent image: null or empty string → remove old image
    else if ((req.body.image === null || req.body.image === "") && user.image) {
      deleteFile(`images/users/${user.image}`);
      image = null;
    }

    const updatedData = {
      fullName: name ?? user.fullName,
      username: user.username,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      hashPwd: user.hashPwd,
      description: description ?? user.description,
      image,
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
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ error: err.message });
  }
};

// PUT me/
const editProfile = async (req, res) => {
  const { name, phone, email, description} = req.body;
  const newImage = req.file ? req.file.filename : null;

  try {
    let message;
    let existingUser;
    let pendingUser;

    const user = await prisma.user.findFirst({ where: { id: req.id } });

    if (email && email !== user.email) {
      existingUser = await prisma.user.findFirst({
        where: { email, id: { not: req.id }, status: "active", },
      });
      pendingUser = await checkPendingApproval(prisma, 'user', ['email'], email);
    }

    if (existingUser || pendingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use or pending approval" });
    }

    let image = user.image;

    if (newImage) {
      if (user.image) {
        deleteFile(`images/users/${user.image}`);
      }
      image = newImage;
    }
    // If frontend sent image: null or empty string → remove old image
    else if ((req.body.image === null || req.body.image === "") && user.image) {
      deleteFile(`images/users/${user.image}`);
      image = null;
    }

    const updatedData = {
      fullName: name ?? user.fullName,
      username: user.username,
      phone: phone.toString() ?? user.phone,
      email: email ?? user.email,
      image: image ?? user.image,
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT me/password
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /users/:id/password
const editUserPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const user = await prisma.user.findFirst({ where: { id: req.params.id } });
  if (!user) {
    return res
      .status(400)
      .json({ message: `User with ID ${req.params.id} doesn't exist` });
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /:id
const deleteUser = async (req, res) => {
  try {
    const needsApproval = req.approval;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        admin: true,
        customer: {
          include: {
            trucks: true,
            jobOrders: true,
          },
        },
        contractor: {
          include: {
            contractorPay: true,
            jobOrders: true,
          },
        },
        employee: {
          include: {
            employeePay: true
          },
        },

        // exclude these from relation checking
        roles: true,
        branches: true,

        // keep all other created/updated relations
        activityLog: true,
        createdUsers: true,
        updatedUsers: true,
        createdRole: true,
        createdBranches: true,
        createdTrucks: true,
        createdTransactions: true,
        createdJobOrders: true,
        createdContractorPays: true,
        createdEquipments: true,
        createdOtherIncomes: true,
        createdOverheads: true,
        transferredTruckOwnerships: true,
        updatedBranches: true,
        updatedTrucks: true,
        updatedTransactions: true,
        updatedJobOrders: true,
        updatedContractorPays: true,
        updatedEquipments: true,
        updatedOtherIncomes: true,
        updatedOverheads: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Check relations, but ignore roles/branches/edits
    const excludedKeys = ["roles", "branches"];
    const hasRelations = relationsChecker(user, excludedKeys);
    console.log(hasRelations)

    let message = hasRelations ? "User marked as inactive (has related records)" : "User deleted successfully"

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
        await tx.userBranch.deleteMany({ where: { userId: user.id } });

        await tx.customer.deleteMany({ where: { userId: user.id } });
        await tx.employee.deleteMany({ where: { userId: user.id } });
        await tx.contractor.deleteMany({ where: { userId: user.id } });
        await tx.admin.deleteMany({ where: { userId: user.id } });


        // finally delete the user
        await tx.user.delete({ where: { id: user.id } });
      }
    })
    

    return res.status(200).json({ message });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /users
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

    where = {...where, ...branchFilter("user", branch, req.branchIds)};

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
    }

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
         orderBy: {
          createdAt: 'desc',
        },
        include: {
          roles: { include: { role: true } },
          branches: { include: { branch: true } },
          contractor: { select: { commission: true } },
        },
      });

      totalItems = await tx.user.count({ where });
      if (limit) totalPages = Math.ceil(totalItems / limit);

      // Exclude sensitive fields
      const formattedUsers = users.map((user) => {
        const { hashPwd, refreshToken, roles, branches, contractor, ...safeUser } = user;

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
          commission: Number(contractor?.commission) || undefined,
        };
      });

      return { users: formattedUsers };
    });

    res.status(200).json({
      data: { ...result, pagination: { totalItems, totalPages } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /:id
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
    res.status(500).json({ error: err.message });
  }
};

// GET /me
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
    res.status(500).json({ error: err.message });
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

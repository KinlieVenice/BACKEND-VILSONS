
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

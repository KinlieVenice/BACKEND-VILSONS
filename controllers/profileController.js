const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const checkPendingApproval = require("../utils/services/checkPendingApproval")


// PUT me/
const editProfile = async (req, res) => {
  const { name, phone, email, description } = req.body;

  try {
    let message;
    let existingUser;
    let pendingUser;

    const user = await prisma.user.findFirst({ where: { id: req.id } });

    if (email && email !== user.email) {
      existingUser = await prisma.user.findFirst({
        where: { email, id: { not: req.id } },
      });
      pendingUser = await checkPendingApproval(prisma, 'user', ['email'], email);
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
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: err.message });
  }
};

module.exports = { editProfile, editProfilePassword, getMyProfile }
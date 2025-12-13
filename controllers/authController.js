const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Both username and password needed" });

  const foundUser = await prisma.user.findUnique({
    where: { username },
    include: { 
      roles: { include: { role: true } },
      branches: { include: { branch: true} }  },
  });
  if (!foundUser) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, foundUser.hashPwd);
  if (match) {
    const roles = foundUser.roles.map((r) => r.role.roleName);
    const branches = foundUser.branches.map((b) => ({
    branchId: b.branch.id,
    branchName: b.branch.branchName,
  }));

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser.id,
        username: foundUser.username,
        roles,
        branches, // clean array of branch objects
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5h" }
  );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await prisma.user.update({
      where: { username: foundUser.username },
      data: { refreshToken },
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, refreshToken });
  } else {
    return res.status(401).json({ message: "Invalid password" });
  }
};

module.exports = { handleLogin };
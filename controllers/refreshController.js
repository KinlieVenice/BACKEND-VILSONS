const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const handleRefresh = async (req, res) => {
  const refreshToken = req.cookies.jwt;

  if (!refreshToken)
    return res.status(401).json({ message: "No cookies found" });

  const foundUser = await prisma.user.findFirst({
    where: { refreshToken },
    include: { roles: { include: { role: true } } },
  });
  if (!foundUser) return res.status(403).json({ message: "No user found, forbidden" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.status(403).json({ message: "Invalid username" });

    const roles = foundUser.roles.map((r) => r.role.roleName);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  });
};

module.exports = { handleRefresh };

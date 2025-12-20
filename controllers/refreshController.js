const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const handleRefresh = async (req, res) => {
  // const refreshToken = req.cookies.jwt;
  const refreshToken = req.cookies.jwt;
  console.log("refreshToken cookie:", req.cookies.jwt);
  console.log("Request origin:", req.headers.origin);

  if (!refreshToken)
    return res.status(401).json({ message: "No cookies found" });

  const foundUser = await prisma.user.findFirst({
    where: { refreshToken },
    include: { 
      roles: { include: { role: true } },
      branches: { include: { branch: true } } 
    },
  });
  
  if (!foundUser) return res.status(403).json({ message: "No user found, forbidden" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.status(403).json({ message: "Invalid username" });

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
          branches,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5h" }
    );

    res.json({ accessToken });
  });
};

module.exports = { handleRefresh };
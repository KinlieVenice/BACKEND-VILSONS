const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Both username and password needed" });

  const user = prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.hashPwd);
  if (match) {
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          roles: user.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    user.refreshToken = refreshToken;
    

  } else {
    return res.status(401).json({ message: "Invalid password" });
  }
};

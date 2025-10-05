const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken (frontend)
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //no content
  const refreshToken = cookies.jwt;

  const foundUser = await prisma.user.findFirst({where: { refreshToken }});
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      // secure: true,
    });
    return res.sendStatus(204);
  }

  await prisma.user.update({
    where: { username: foundUser.username },
    data: { refreshToken: "" },
  });

  res.clearCookie("jwt", {
    httpOnly: true,
    // secure: true,
    sameSite: "None",
  });
  res.sendStatus(204);
};

module.exports = { handleLogout };

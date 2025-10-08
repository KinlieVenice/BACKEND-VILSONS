const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  console.log("hey", authHeader); // Bearer token
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.sendStatus(403); //invalid token
    }
    req.id = decoded.UserInfo.id;
    req.username = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    req.branchIds = decoded.UserInfo.branches.map(b => b.branchId);
    req.branchNames = decoded.UserInfo.branches.map(b => b.branchName);


    console.log(req.branchIds, req.branchNames)
    next();
  });
};

module.exports = verifyJWT;

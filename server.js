require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const app = express();
const path = require("path");

const PORT = process.env.PORT || 3550;

const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require('./middleware/verifyJWT');
const sanitizeInput = require('./middleware/sanitizeInput');

// middleware for log handling
app.use(logger);

// urlencoded date
app.use(express.urlencoded({ extended: false }));

// json middleware for auto parse
app.use(express.json());

app.use(cookieParser());

app.use(sanitizeInput);

app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJWT);
app.use("/api/users", require("./routes/api/users"));
app.use("/api/roles", require("./routes/api/roles"));
app.use("/api/branches", require("./routes/api/branches"));
app.use("/api/trucks", require("./routes/api/trucks"));
app.use("/api/joborders", require("./routes/api/jobOrders"));

app.all(/^.*$/, (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// middleware for error handling
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));



require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = express();
const path = require("path");
const cors = require("cors");

const PORT = process.env.PORT || 3550;

const corsMiddleware = require("./middleware/cors");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require('./middleware/verifyJWT');
const sanitizeInput = require('./middleware/sanitizeInput');
const { webhookHandler } = require("./controllers/onlineTransactionController")

// CORS setup (temporary open version for development)
app.use(corsMiddleware); // apply global CORS middleware

// middleware for log handling
app.use(logger);

// urlencoded date
app.use(express.urlencoded({ extended: false }));

// app.post("/api/online-transactions/webhook", bodyParser.raw({ type: "application/json" }), webhookHandler);

// json middleware for auto parse
app.use(express.json());

app.use(cookieParser());

app.use(sanitizeInput);

app.use("/auth", require("./routes/auth"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(express.static(path.join(__dirname, "views")));

app.use(verifyJWT);
app.use("/api/users", require("./routes/api/users"));
app.use("/api/roles", require("./routes/api/roles"));
app.use("/api/approval-logs", require("./routes/api/approvalLogs"));
app.use("/api/branches", require("./routes/api/branches"));
app.use("/api/dashboard", require("./routes/api/dashboard"));
app.use("/api/trucks", require("./routes/api/trucks"));
app.use("/api/job-orders", require("./routes/api/jobOrders"));
app.use("/api/contractor-pays", require("./routes/api/contractorPays"));
app.use("/api/employee-pays", require("./routes/api/employeePays"));
app.use("/api/labors", require("./routes/api/labors"));
app.use("/api/me", require("./routes/api/me"));
app.use("/api/contractors", require("./routes/api/contractors"));
app.use("/api/employees", require("./routes/api/employees"));
app.use("/api/customers", require("./routes/api/customers"));
app.use("/api/equipments", require("./routes/api/equipments"));
app.use("/api/materials", require("./routes/api/materials"));
app.use("/api/other-incomes", require("./routes/api/otherincomes"));
app.use("/api/overheads", require("./routes/api/overheads"));
app.use("/api/online-transactions", require("./routes/api/onlineTransactions"));
app.use("/api/transactions", require("./routes/api/transactions"));
app.use("/api/finances", require("./routes/api/finances"));


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



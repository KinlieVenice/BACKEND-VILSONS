require("dotenv").config();
const express = require("express");
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3550;

const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

// middleware for log handling
app.use(logger);

// urlencoded date
app.use(express.urlencoded({ extended: false }));

// json middleware for auto parse
app.use(express.json());

app.use("/api/users", require("./routes/api/users"));
app.use("/api/roles", require("./routes/api/roles"));


// middleware for error handling
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));



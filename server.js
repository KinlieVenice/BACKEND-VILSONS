require("dotenv").config();
const express = require("express");
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

// middleware for error handling
app.use(errorHandler);

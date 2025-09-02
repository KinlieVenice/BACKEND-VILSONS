const express = require("express");
const router = express.Router();
const frefreshController = require("../controllers/refreshController");

router.get("/", frefreshController.handleRefresh);

module.exports = router;

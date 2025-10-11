const express = require("express");
const router = express.Router();
const onlineTransactionController = require("../../controllers/onlineTransactionController");

router.route("/")
.post(onlineTransactionController.createCheckoutSession);

module.exports = router;

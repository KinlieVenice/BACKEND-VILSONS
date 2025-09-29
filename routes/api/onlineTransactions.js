const express = require("express");
const router = express.Router();
const { createCheckoutSession, webhookHandler,} = require("../../controllers/onlineTransactionController");

// Routes
router.post("/checkout-session", createCheckoutSession);
router.post("/webhook", webhookHandler);

module.exports = router;

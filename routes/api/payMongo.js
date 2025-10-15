const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../../controllers/admin/paymongoController");

// POST /paymongo/create-checkout
router.post("/create-checkout", createCheckoutSession);

module.exports = router;

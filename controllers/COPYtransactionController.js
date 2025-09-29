const axios = require("axios");
const prisma = require("../prisma/client");

// 1. Create Checkout Session + save pending transaction
const createCheckoutSession = async (req, res) => {
  try {
    const { amount, description, email, senderName } = req.body;

    // Call PayMongo API to create Checkout Session
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: description,
                amount: amount * 100, // centavos
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash", "paymaya", "card"],
            description, // maps to jobOrderCode
            customer: { email, name: senderName },
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
          },
        },
      },
      {
        auth: {
          username: process.env.PAYMONGO_SECRET,
          password: "",
        },
      }
    );

    const session = response.data.data;

    // Save as "pending" transaction
    await prisma.transaction.create({
      data: {
        jobOrderCode: description,
        senderName,
        sessionId: session.id,
        amount,
        email,
        status: "pending",
      },
    });

    res.json({ checkoutUrl: session.attributes.checkout_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// 2. Webhook to update transaction after payment
const webhookHandler = async (req, res) => {
  try {
    const event = req.body;
    const type = event.data.attributes.type;
    const data = event.data.attributes.data;

    if (type === "checkout_session.payment.paid") {
      const session = data.attributes;
      const payment = session.payments[0];

      const transactionData = {
        referenceNumber: payment.attributes.source.reference_number, // ✅ actual receipt ref
        mop: payment.attributes.source.type, // gcash, card, paymaya
        amount: payment.attributes.amount / 100, // convert centavos to pesos
        status: "paid",
      };

      await prisma.transaction.updateMany({
        where: { sessionId: data.id },
        data: transactionData,
      });

      return res.json({
        success: true,
        message: "Payment successful",
        transaction: transactionData,
      });
    }

    if (type === "checkout_session.payment.failed") {
      await prisma.transaction.updateMany({
        where: { sessionId: data.id },
        data: { status: "failed" },
      });

      return res.json({
        success: false,
        message: "Payment failed",
        sessionId: data.id,
      });
    }

    // Ignore other events
    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Webhook failed" });
  }
};

module.exports = { createCheckoutSession, webhookHandler };

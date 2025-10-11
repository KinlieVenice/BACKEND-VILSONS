const axios = require("axios");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Create Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { amount, description, email, senderName } = req.body;

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

// 2. Webhook Handler with Signature Verification (updated)
const webhookHandler55 = async (req, res) => {
  try {
    const signature = req.headers["paymongo-signature"];
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    const rawBody = req.body.toString("utf8");

    if (!verifySignature(rawBody, signature, secret)) {
      console.log("❌ Invalid PayMongo signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);
    console.log("🧾 Full Webhook Body:", JSON.stringify(event, null, 2));

    const type = event.data?.attributes?.type;
    const payload = event.data?.attributes?.data;

    console.log("🔔 Webhook event:", type);

    if (type === "checkout_session.payment.paid") {
      const session = payload.attributes;
      const payment = session.payments?.[0];
      if (!payment) return res.status(200).json({ message: "No payment data" });

      const transactionData = {
        referenceNumber: payment.attributes.source.reference_number,
        mop: payment.attributes.source.type,
        amount: payment.attributes.amount / 100,
        status: "successful",
      };

      const updated = await prisma.transaction.updateMany({
        where: { sessionId: payload.id },
        data: transactionData,
      });

      console.log("✅ Updated transactions:", updated.count);
      return res.json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// 2. Webhook Handler with Signature Verification
const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers["paymongo-signature"];
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!verifySignature(req.rawBody, signature, secret)) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;
    const type = event.data.attributes.type;
    const payload = event.data.attributes.data;

    if (type === "checkout_session.payment.paid") {
      const session = payload.attributes;
      const payment = session.payments[0];

      const transactionData = {
        referenceNumber: payment.attributes.source.reference_number,
        mop: payment.attributes.source.type,
        amount: payment.attributes.amount / 100,
        status: "paid",
      };

      await prisma.transaction.updateMany({
        where: { sessionId: payload.id },
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
        where: { sessionId: payload.id },
        data: { status: "failed" },
      });

      return res.json({
        success: false,
        message: "Payment failed",
        sessionId: payload.id,
      });
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Webhook failed" });
  }
};

// Helper: Verify webhook signature
function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split("=")[1];
  const signature = signaturePart.split("=")[1];

  const payload = `${timestamp}.${rawBody}`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

module.exports = { createCheckoutSession, webhookHandler };



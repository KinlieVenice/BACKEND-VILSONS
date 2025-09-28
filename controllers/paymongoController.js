const axios = require("axios");

const createCheckoutSession = async (req, res) => {
  console.log(process.env.PAYMONGO_SECRET)
  try {
    const { amount, description } = req.body;

    // Create checkout session with PayMongo
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: description || "Test Product", // Item name
                amount: amount * 100,                // Amount in centavos
                currency: "PHP",
                quantity: 1
              }
            ],
            payment_method_types: ["gcash", "paymaya", "card"],
            success_url: "https://yourdomain.com/success",
            cancel_url: "https://yourdomain.com/cancel",
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


    res.json({
      checkoutUrl: response.data.data.attributes.checkout_url,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

module.exports = {
  createCheckoutSession,
};

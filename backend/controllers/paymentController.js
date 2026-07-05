const crypto = require("crypto");

let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  const Razorpay = require("razorpay");
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("xxxx")) {
    return null; // keys not configured yet
  }
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return razorpayInstance;
};

// @route POST /api/payment/create-order
// body: { amount } amount in rupees
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const instance = getRazorpay();

    if (!instance) {
      // Razorpay keys not configured - return a mock order so the flow can still be
      // tested end-to-end locally. Replace RAZORPAY_KEY_ID/SECRET in .env with real
      // test keys from https://dashboard.razorpay.com/app/keys to use real test-mode checkout.
      return res.json({
        mock: true,
        id: "order_mock_" + Date.now(),
        amount: Math.round(amount * 100),
        currency: "INR",
        key: "rzp_test_mock",
      });
    }

    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({ ...order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mock } = req.body;

    if (mock) {
      // Mock/dev-mode payment - always succeeds so devs without Razorpay keys can test the flow
      return res.json({ verified: true, paymentId: "pay_mock_" + Date.now() });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ verified: true, paymentId: razorpay_payment_id });
    }
    res.status(400).json({ verified: false, message: "Payment verification failed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

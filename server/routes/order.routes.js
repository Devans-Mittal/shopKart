
const express = require("express");
const router = express.Router();

const { createOrder, createRazorpayOrder, verifyPayment } = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All order routes require authentication
router.post("/", authMiddleware, createOrder);
router.post("/:orderId/payment", authMiddleware, createRazorpayOrder);
router.post("/:orderId/verify-payment", authMiddleware, verifyPayment);

module.exports = router;

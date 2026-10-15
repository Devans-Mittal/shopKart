
const express = require("express");
const router = express.Router();

const { addToCart, getCart, updateCartItem, removeFromCart } = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All cart routes require authentication
router.post("/:productId", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;

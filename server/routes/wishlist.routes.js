
const express = require("express");
const router = express.Router();

const wishlist = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All wishlist routes require authentication
router.use(authMiddleware);

router.post("/:productId", wishlist.addToWishlist);
router.get("/", wishlist.getWishlist);
router.delete("/:productId", wishlist.removeFromWishlist);
module.exports = router;
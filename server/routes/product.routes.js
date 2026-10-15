const express = require("express");
const router = express.Router();
const product = require("../controllers/product.controller");
router.post("/", product.createProduct);
router.get("/", product.getProducts);
router.get("/:id", product.getProduct);
module.exports = router;

const Product = require("../models/product.model");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock
    } = req.body;

    // Check required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0"
      });
    }

    // Validate stock
    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    // Search by product name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query);

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET SINGLE PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    console.error("Get product error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
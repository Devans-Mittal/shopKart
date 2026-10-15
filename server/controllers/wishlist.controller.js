
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ADD PRODUCT TO WISHLIST
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Check whether the product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find the authenticated customer
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Prevent duplicate wishlist entries
        if (customer.wishlist.some(
            id => id.toString() === productId
        )) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist"
            });
        }

        // 5. Save the product reference
        customer.wishlist.push(product._id);
        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .populate({
                path: "wishlist",
                select: "name price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find the authenticated customer
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 3. Check whether the product is in the wishlist
        const index = customer.wishlist.findIndex(
            id => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        // 4. Remove and save
        customer.wishlist.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find the logged-in customer
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Check whether product is already in cart
        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = cartItem
            ? cartItem.quantity + 1
            : 1;

        // 5. Check stock
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        // 6. Update or add the cart item
        if (cartItem) {
            cartItem.quantity = newQuantity;
        } else {
            customer.cart.push({
                product: product._id,
                quantity: 1
            });
        }

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }
};



const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .populate({
                path: "cart.product",
                select: "name description price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Remove cart entries whose products no longer exist
        const validCart = customer.cart.filter(
            (item) => item.product !== null
        );

        return res.status(200).json({
            success: true,
            count: validCart.reduce(
                (total, item) => total + item.quantity,
                0
            ),
            cart: validCart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
};



const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Quantity must be a positive integer
        if (
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Only enforce stock limits when increasing the quantity.
        // Allow decreases even if the existing cart quantity exceeds stock.
        if (
            quantity > cartItem.quantity &&
            quantity > product.stock
        ) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are currently available`
            });
        }

        cartItem.quantity = quantity;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart"
        });
    }
};



const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const index = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        customer.cart.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart"
        });
    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove product from cart"
        });
    }
};



module.exports = { addToCart, getCart, updateCartItem, removeFromCart };


// const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order from the logged-in customer's cart
const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode
        } = req.body;

        // 1. Validate delivery address
        const addressFields = {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode
        };

        const missingField = Object.values(addressFields).some(
            (value) => typeof value !== "string" || !value.trim()
        );

        if (missingField) {
            return res.status(400).json({
                success: false,
                message: "Please provide all delivery address fields."
            });
        }

        // 2. Find the logged-in customer and populate cart products
        const customer = await Customer.findById(req.user.id)
            .populate("cart.product");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        if (!customer.cart.length) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        // 3. Validate stock and calculate total using database prices
        const orderItems = [];
        let totalAmount = 0;

        for (const item of customer.cart) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists."
                });
            }

            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product quantity in cart."
                });
            }

            // Re-fetch the current product record
            const currentProduct = await Product.findById(product._id);

            if (!currentProduct) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is no longer available.`
                });
            }

            if (currentProduct.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${currentProduct.name}.`
                });
            }

            if (
                !Number.isFinite(currentProduct.price) ||
                currentProduct.price < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${currentProduct.name}.`
                });
            }

            orderItems.push({
                product: currentProduct._id,
                name: currentProduct.name,
                price: currentProduct.price,
                quantity: item.quantity
            });

            totalAmount += currentProduct.price * item.quantity;
        }

        // 4. Create the order with a server-calculated total
        const order = await Order.create({
            customer: customer._id,
            items: orderItems,
            deliveryAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine: addressLine.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            totalAmount: Math.round(totalAmount * 100) / 100
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully. Payment is pending.",
            order
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create order."
        });
    }
};


// Create a Razorpay payment order for an existing ShopKart order
const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            customer: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "This order has already been paid.",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString(),
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully.",
            keyId: process.env.RAZORPAY_KEY_ID,
            razorpayOrder,
        });
    } catch (error) {
        console.error("Create Razorpay order error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order.",
        });
    }
};




const verifyPayment = async (req, res) => {
    const session = await Order.startSession();

    try {
        const { orderId } = req.params;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details.",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            customer: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment was already verified.",
                order,
            });
        }

        if (
            !order.razorpayOrderId ||
            order.razorpayOrderId !== razorpay_order_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID does not match.",
            });
        }

        // 1. Verify Razorpay signature.
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const signatureBuffer = Buffer.from(razorpay_signature, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");

        if (
            !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
            signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed.",
            });
        }

        // 2. Confirm the actual payment with Razorpay.
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (
            payment.order_id !== razorpay_order_id ||
            payment.amount !== Math.round(order.totalAmount * 100) ||
            payment.currency !== "INR" ||
            payment.status !== "captured"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment is not captured or does not match this order.",
            });
        }

        // 3. Atomically update the order, stock, and cart.
        await session.withTransaction(async () => {
            const currentOrder = await Order.findOne({
                _id: orderId,
                customer: req.user.id,
            }).session(session);

            if (!currentOrder) {
                throw new Error("ORDER_NOT_FOUND");
            }

            // Handles repeated or concurrent verification attempts.
            if (currentOrder.paymentStatus === "paid") {
                return;
            }

            if (
                currentOrder.paymentStatus !== "pending" ||
                currentOrder.stockDeducted
            ) {
                throw new Error("ORDER_ALREADY_PROCESSED");
            }

            for (const item of currentOrder.items) {
                const product = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        stock: { $gte: item.quantity },
                    },
                    {
                        $inc: { stock: -item.quantity },
                    },
                    {
                        returnDocument: "after",
                        session,
                    }
                );

                if (!product) {
                    throw new Error("INSUFFICIENT_STOCK");
                }
            }

            const customer = await Customer.findById(
                currentOrder.customer
            ).session(session);

            if (!customer) {
                throw new Error("CUSTOMER_NOT_FOUND");
            }

            customer.cart = [];
            await customer.save({ session });

            currentOrder.razorpayPaymentId = razorpay_payment_id;
            currentOrder.paymentStatus = "paid";
            currentOrder.orderStatus = "confirmed";
            currentOrder.stockDeducted = true;

            await currentOrder.save({ session });
        });

        const updatedOrder = await Order.findById(orderId);

        return res.status(200).json({
            success: true,
            message: "Payment verified and order confirmed successfully.",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Verify payment error:", error);

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(409).json({
                success: false,
                message:
                    "Payment was captured, but stock is insufficient. Contact support for a refund.",
            });
        }

        if (error.message === "ORDER_ALREADY_PROCESSED") {
            return res.status(409).json({
                success: false,
                message: "This order has already been processed.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to verify and process payment.",
        });
    } finally {
        await session.endSession();
    }
};




module.exports = { createOrder, createRazorpayOrder, verifyPayment };


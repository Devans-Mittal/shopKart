const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
const wishlistRoutes = require("./routes/wishlist.routes");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://thriving-rugelach-2f5ea7.netlify.app",
  credentials: true
}));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ShopKart Authentication API is running"
  });
});

app.use("/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

// Start server first
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// Then connect to MongoDB
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log(
      "MongoDB replica set:",
      mongoose.connection.client.topology.description.type
    );
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection FAILED", err);
    process.exit(1);
  });


// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });
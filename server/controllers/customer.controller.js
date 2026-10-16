
const Customer = require("../models/customer.model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be 6+ characters" });

    const exists = await Customer.findOne({ email });

    if (exists)
      return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer || !(await bcrypt.compare(password, customer.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(customer._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.me = async (req, res) => {
  const customer = await Customer
    .findById(req.user.id)
    .select("-password");

  res.json(customer);
};



exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({
    success: true,
    message: "Logged out successfully"
  });
};


// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({
        message: "Old password and new password are required"
      });

    if (newPassword.length < 6)
      return res.status(400).json({
        message: "New password must be 6+ characters"
      });

    const customer = await Customer.findById(req.user.id);

    if (!customer)
      return res.status(401).json({
        message: "Unauthorized"
      });

    // Verify old password
    const isMatch = await bcrypt.compare(
      oldPassword,
      customer.password
    );

    if (!isMatch)
      return res.status(401).json({
        message: "Old password is incorrect"
      });

    // Hash new password
    customer.password = await bcrypt.hash(newPassword, 10);

    await customer.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
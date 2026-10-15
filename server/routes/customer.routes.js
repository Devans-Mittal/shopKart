
const express = require("express");
const router = express.Router();

const customer = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", customer.register);
router.post("/login", customer.login);
router.get("/me", auth, customer.me);
router.post("/logout", auth, customer.logout);
router.patch("/change-password", auth, customer.changePassword);

module.exports = router;
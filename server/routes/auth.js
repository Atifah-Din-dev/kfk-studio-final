const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    getCustomerProfile,
    updateProfile,
    changePassword
} = require("../controller/authController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes - require authentication
router.get("/profile", auth, getCustomerProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;

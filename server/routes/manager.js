const express = require("express");
const router = express.Router();
const {
    register,
    login,
    getManagerProfile,
    updateProfile,
    changePassword,
    getDashboardStats,
    getAllBookings,
    getAllCustomers,
    updateBookingStatus
} = require("../controller/managerController");
const managerAuth = require("../middleware/managerAuth");

console.log("Manager routes file loaded");

router.use((req, res, next) => {
    console.log(`Manager route accessed: ${req.method} ${req.path} - Full URL: ${req.originalUrl}`);
    next();
});

router.post("/register", register);
router.post("/login", login);
console.log("Manager routes registered: POST /register, POST /login");

router.get("/profile", managerAuth, getManagerProfile);
router.put("/profile", managerAuth, updateProfile);
router.put("/change-password", managerAuth, changePassword);
router.get("/dashboard-stats", managerAuth, getDashboardStats);
router.get("/bookings", managerAuth, getAllBookings);
router.get("/customers", managerAuth, getAllCustomers);
router.put("/booking-status", managerAuth, updateBookingStatus);

module.exports = router;

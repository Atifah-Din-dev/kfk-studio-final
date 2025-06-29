const express = require("express");
const router = express.Router();
const {
    createBooking,
    getCustomerBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getAllBookings,
    addBookingNote,
    getAvailableTimeSlots
} = require("../controller/bookingController");
const auth = require("../middleware/auth");

// Protected routes - require authentication
router.post("/", auth, createBooking);
router.get("/Customer", auth, getCustomerBookings);
router.get("/all", auth, getAllBookings);
router.get("/available-slots", getAvailableTimeSlots); // This endpoint doesn't need auth for initial checking
router.get("/:id", auth, getBookingById);
router.put("/:id/status", auth, updateBookingStatus);
router.put("/:id/cancel", auth, cancelBooking);
router.put("/:id/notes", auth, addBookingNote);

module.exports = router;
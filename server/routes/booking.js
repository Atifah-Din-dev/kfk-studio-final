// server/routes/booking.js
// Routes for booking operations, including creating, updating, and retrieving bookings

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
const managerAuth = require("../middleware/managerAuth");

router.post("/", auth, createBooking);
router.get("/Customer", auth, getCustomerBookings);
router.get("/all", auth, getAllBookings);
router.get("/available-slots", getAvailableTimeSlots);
router.get("/:id", auth, getBookingById);
router.put("/:id/status", managerAuth, updateBookingStatus);
router.put("/:id/cancel", auth, cancelBooking);
router.put("/:id/notes", auth, addBookingNote);

module.exports = router;



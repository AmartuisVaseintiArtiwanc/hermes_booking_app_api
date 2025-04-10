const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

// Join an event
router.post("/", authenticateToken, bookingController.createBooking);

// Cancel a booking
router.delete("/cancel/:eventId", authenticateToken, bookingController.cancelBooking);

// Get user's bookings (past & upcoming)
router.get("/user/", authenticateToken, bookingController.getUserBookings);

// Get event participants
router.get("/event/:eventId", authenticateToken, bookingController.getEventParticipants);

module.exports = router;

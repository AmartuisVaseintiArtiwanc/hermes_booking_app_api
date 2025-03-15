const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { authenticateToken, authorizeExpertOrAbove } = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

// Create a facility (Admin only)
router.post(
    "/",
    authenticateToken,
    authorizeExpertOrAbove,
    [
        body("title").notEmpty().withMessage("Title is required"),
        body("date").isISO8601().withMessage("Invalid date format"),
        body("start_time").notEmpty().withMessage("Start time is required"),
        body("end_time").notEmpty().withMessage("End time is required"),
        body("facility_id").isInt().withMessage("Facility ID must be an integer"),
        body("quota").isInt({ min: 2 }).withMessage("Quota must be a positive integer with at least 2 amount"),
    ],
    eventController.createEvent
);

// Get all events (Public)
router.get("/", authenticateToken, eventController.getEvents);

// Get event by ID (Public)
router.get("/:id", authenticateToken, param("id").isInt(), eventController.getEventById);

// Update event (Admin & Expert Only)
router.put("/:id", authenticateToken, authorizeExpertOrAbove, param("id").isInt(), eventController.updateEvent);

// Delete event (Admin & Expert Only)
router.delete("/:id", authenticateToken,  authorizeExpertOrAbove, param("id").isInt(), eventController.deleteEvent);



module.exports = router;
const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require("../middleware/authMiddleware");
const facilityController = require("../controllers/facilityController");

// Create a facility (Admin only)
router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    [
        body("name").notEmpty().withMessage("name is required"),
        body("location").notEmpty().withMessage("location is required"),
    ],
    facilityController.createFacility
);

// Get all facilities (Open to all users)
router.get("/", authenticateToken, param("id").isInt(), facilityController.getAllFacilities);

// Update facility (Admin only)
router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    [
        body("name").notEmpty().withMessage("name is required"),
        body("location").notEmpty().withMessage("location is required"),
        param("id").isInt()
    ],
    facilityController.updateFacility
);

// Delete facility (Admin only)
router.delete("/:id", authenticateToken, authorizeAdmin, facilityController.deleteFacility);

module.exports = router;
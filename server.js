require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");

//routes imports
const userRoutes = require("./src/routes/userRoutes");
const facilityRoutes = require("./src/routes/facilityRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

// Initialize app
const app = express();
app.use(express.json());
app.use(cors());

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

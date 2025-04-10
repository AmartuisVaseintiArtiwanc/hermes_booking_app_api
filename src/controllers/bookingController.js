const { validationResult } = require("express-validator");
const moment = require("moment");
const db = require("../config/db"); // Import MySQL connection

const createBooking = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.userId;

    try {
        // Check if event exists
        const [event] = await db.query("SELECT * FROM events WHERE id = ?", [eventId]);
        if (event.length === 0) return res.status(404).json({ message: "Event not found." });

        // Check if user already booked
        const [existingBooking] = await db.query("SELECT * FROM event_participants WHERE user_id = ? AND event_id = ?", [userId, eventId]);
        if (existingBooking.length > 0) return res.status(400).json({ message: "Already booked this event." });

        // Check if quota is full
        const [quota] = await db.query("SELECT COUNT(*) AS count FROM event_participants WHERE event_id = ?", [eventId]);
        if (quota[0].count >= event[0].quota) return res.status(400).json({ message: "Event is full." });

        // Check if booking is within allowed timeframe
        const eventTime = moment(event[0].date).hour(event[0].start_time.split(":")[0]);
        if (moment().isAfter(eventTime.subtract(1, "hour"))) {
            return res.status(400).json({ message: "Bookings must be made at least 1 hour in advance." });
        }

        // Insert booking
        await db.query("INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)", [userId, eventId]);
        res.json({ message: "Successfully booked the event." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}

const cancelBooking = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    try {
        // Find booking
        const [booking] = await db.query("SELECT e.date, ep.user_id FROM event_participants ep JOIN events e ON ep.event_id = e.id WHERE e.id = ? AND ep.user_id = ?", [eventId, userId]);
        if (booking.length === 0) return res.status(404).json({ message: "Booking not found." });

        // Prevent same-day cancellations
        const eventDate = moment(booking[0].date);
        if (moment().isSame(eventDate, "day")) {
            return res.status(400).json({ message: "Cancellations on event day are not allowed." });
        }

        // Cancel booking
        await db.query("DELETE FROM event_participants WHERE event_id = ? AND user_id = ?", [eventId, userId]);
        res.json({ message: "Successfully canceled the booking." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
}

const getUserBookings = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [bookings] = await db.query(
            "SELECT ep.id as bookingId, e.id as eventId, e.title, e.date, e.start_time, e.end_time FROM event_participants ep JOIN events e ON ep.event_id = e.id WHERE ep.user_id = ?",
            [userId]
        );

        const upcoming = bookings.filter(ep => moment(ep.date).isAfter(moment()));
        const past = bookings.filter(ep => moment(ep.date).isBefore(moment()));

        res.json({ upcoming, past });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}

const getEventParticipants = async (req, res) => {
    const { eventId } = req.params;

    try {
        const [participants] = await db.query(
            "SELECT u.id AS userId, u.username FROM event_participants ep JOIN users u ON ep.user_id = u.id WHERE ep.event_id = ?",
            [eventId]
        );

        res.json({ eventId, participants });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = {
    createBooking,
    cancelBooking,
    getUserBookings,
    getEventParticipants
};

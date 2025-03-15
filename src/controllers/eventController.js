const { validationResult } = require("express-validator");
const db = require("../config/db"); // Import MySQL connection

const createEvent = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title, description, date, start_time, end_time, facility_id, quota } = req.body;
    
        // Insert into DB
        const [result] = await db.execute(
          "INSERT INTO events (title, description, date, start_time, end_time, facility_id, expert_id, quota) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [title, description, date, start_time, end_time, facility_id, req.user.userId, quota]
        );
    
        res.status(201).json({ id: result.insertId, title, description, date, start_time, end_time, facility_id, quota });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const getEvents = async (req, res) => {
    try {
        const [events] = await db.execute(
        "SELECT e.id, e.title, e.date, e.start_time, e.end_time, f.name AS facility, e.quota, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participants FROM events e JOIN facilities f ON e.facility_id = f.id"
        );
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getEventById = async (req, res) => {
    try {
        const [event] = await db.execute(
          "SELECT e.*, f.name AS facility FROM events e JOIN facilities f ON e.facility_id = f.id WHERE e.id = ?",
          [req.params.id]
        );
    
        if (event.length === 0) return res.status(404).json({ message: "Event not found" });
    
        // Fetch participants
        const [participants] = await db.execute(
          "SELECT u.username FROM event_participants ep JOIN users u ON ep.user_id = u.id WHERE ep.event_id = ?",
          [req.params.id]
        );
    
        event[0].participants = participants.map((p) => p.username);
        res.json(event[0]);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const updateEvent = async (req, res) => {
    try {
        const [selectedEventCreator] = await db.execute(
            "SELECT e.expert_id, u.role_level FROM events e JOIN users u ON e.expert_id = u.id WHERE e.id =?",
            [req.params.id]
          );
        
          const { id } = req.params;

          if (selectedEventCreator.length === 0) return res.status(404).json({ message: "Event not found" });
          if (selectedEventCreator[0].expert_id !== req.user.userId && req.user.role_level < 3) return res.status(500).json({ message: "Unauthorized event modification" });

        const { title, description, date, start_time, end_time, facility_id, quota } = req.body;
        
        // Update event
        await db.execute(
          "UPDATE events SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, facility_id = ?, quota = ? WHERE id = ?",
          [title, description, date, start_time, end_time, facility_id, quota, id]
        );
    
        res.json({ message: "Event updated successfully." });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const deleteEvent = async (req, res) => {
    try {
        const [selectedEventCreator] = await db.execute(
            "SELECT e.expert_id, u.role_level FROM events e JOIN users u ON e.expert_id = u.id WHERE e.id =?",
            [req.params.id]
        );
    
        const { id } = req.params;

        if (selectedEventCreator.length === 0) return res.status(404).json({ message: "Event not found" });
        if (selectedEventCreator[0].expert_id !== req.user.userId && req.user.role_level < 3) return res.status(500).json({ message: "Unauthorized event modification" });

      await db.execute("DELETE FROM events WHERE id = ?", [req.params.id]);
      res.json({ message: "Event deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
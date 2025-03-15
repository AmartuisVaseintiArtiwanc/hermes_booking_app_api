const db = require("../config/db");

const createFacility = async (req, res) => {
    const { name, location } = req.body;

    if (!name || !location) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [result] = await db.execute(
            "INSERT INTO facilities (name, location) VALUES (?, ?)",
            [name, location]
        );
        res.status(201).json({ id: result.insertId, name, location });
    } catch (error) {
        console.log("LOGS |||| error : ", error);
        res.status(500).json({ message: "Error creating facility." });
    }
}

const getAllFacilities = async (req, res) => {
    try {
        const [facilities] = await db.execute("SELECT * FROM facilities");
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching facilities." });
    }
}

const updateFacility = async (req, res) => {
    const { name, location } = req.body;
    const { id } = req.params;

    try {
        const [result] = await db.execute(
            "UPDATE facilities SET name=?, location=? WHERE id=?",
            [name, location, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Facility not found." });
        }
        res.json({ message: "Facility updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error updating facility." });
    }
}

const deleteFacility = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute("DELETE FROM facilities WHERE id=?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Facility not found." });
        }
        res.json({ message: "Facility deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting facility." });
    }
}

module.exports = {
    createFacility,
    getAllFacilities,
    updateFacility,
    deleteFacility
};
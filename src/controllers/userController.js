require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../config/db"); // Import MySQL connection

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, username, password } = req.body;

    try {
      // Check if user already exists
      const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser.length) return res.status(400).json({ message: "Email already registered" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into DB
      await db.query("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [
        email,
        username,
        hashedPassword,
      ]);

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      // Check if user exists
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (!users.length) return res.status(400).json({ message: "Invalid email or password" });

      const user = users[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email, role_level: user.role_level }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

const getProfile = async (req, res) => {
    try {
      const [user] = await db.query("SELECT id, email, username, role, role_level FROM users WHERE id = ?", [req.user.userId]);
      if (!user.length) return res.status(404).json({ message: "User not found" });
  
      res.json(user[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getProfile
};

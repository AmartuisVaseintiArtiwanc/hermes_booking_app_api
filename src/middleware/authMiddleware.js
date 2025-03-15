const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Import database connection

// Middleware to verify JWT
const authenticateToken = async (req, res, next) =>  {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;

      next();
    } catch (err) {
      res.status(403).json({ message: "Invalid token" });
    }
  }


const authorizeAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    // Check user role in the database
    try {
        const [rows] = await db.execute("SELECT role_level FROM users WHERE id = ?", [req.user.userId]);
        if (rows.length === 0 || rows[0].role_level != 3) {
            return res.status(403).json({ message: "Access Denied. Admins only." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Database error." });
    }
};

const authorizeExpertOrAbove = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    // Check user role in the database
    try {
        const [rows] = await db.execute("SELECT role_level FROM users WHERE id = ?", [req.user.userId]);
        if (rows.length === 0 || rows[0].role_level < 2) {
            return res.status(403).json({ message: "Access Denied. Expert or Admins only." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Database error." });
    }
};



module.exports = { authenticateToken, authorizeAdmin, authorizeExpertOrAbove };

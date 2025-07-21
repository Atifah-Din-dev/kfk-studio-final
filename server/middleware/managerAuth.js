// server/middleware/managerAuth.js
// Middleware for authenticating manager requests, checking JWT token validity, and manager status

const jwt = require("jsonwebtoken");
const Manager = require("../model/manager");

module.exports = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const manager = await Manager.findById(decoded.id);

        if (!manager) {
            return res.status(401).json({ msg: "Manager not found" });
        }

        if (!manager.isActive) {
            return res.status(401).json({ msg: "Manager account is deactivated" });
        }

        manager.lastLogin = Date.now();
        await manager.save();

        req.manager = { id: decoded.id };
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired" });
        }
        console.error("Manager auth middleware error:", err);
        res.status(401).json({ msg: "Invalid token" });
    }
};

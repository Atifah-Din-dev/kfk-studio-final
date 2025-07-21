// server/middleware/auth.js
// Middleware for authenticating customer requests using JWT

const jwt = require("jsonwebtoken");
const Customer = require("../model/Customer");

module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find Customer by id and update last active timestamp
        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(401).json({ msg: "Customer not found" });
        }

        // Update last active timestamp
        customer.lastActive = Date.now();
        await customer.save();

        // Add Customer id to request object
        req.Customer = { id: decoded.id };
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired" });
        }
        res.status(401).json({ msg: "Invalid token" });
    }
};
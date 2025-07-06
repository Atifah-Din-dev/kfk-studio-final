const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: './config.env' }); // Specify the path to config.env

// Check for required environment variables
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing in environment variables. Authentication will fail!");
    process.exit(1);
}

const app = express();
// app.use(cors());
// app.use(cors({
//     origin: '*', // or limit to your frontend IP
// }));
app.use(cors({
    // origin: 'http://localhost:3000', // Localhost for development
    origin: 'http://192.168.3.143:3000', // UTM IP address
    // origin: 'http://192.168.50.212:3000', // Rumah Nad IP address
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json());

// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
    res.send("KFK Studio API is running. Use /api/auth and /api/bookings endpoints.");
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/services", require("./routes/services"));

// Ensure proper error handling for unhandled routes
app.use((req, res, next) => {
    res.status(404).json({ msg: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler caught an error:", err);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
});

const connectDB = require("./connect.cjs");

// Connect to the database
connectDB()
    .then(() => {
        // Start the server after successful database connection
        console.log("Starting HTTP server...");
        app.listen(5000, '0.0.0.0', () => {
            console.log("Server started on port 5000 and open to network");
        });

    })
    .catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });

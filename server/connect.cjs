const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const connectDB = async () => {
    try {
        // Fix: Ensure the database name is properly formatted without slashes
        const dbName = "KFK_STUDIO"; // Using underscore instead of hyphen for safety

        // Create a connection string without explicitly specifying the database in the URI
        const connectionString = process.env.ATLAS_URI;

        // Connect with the database name as a separate option
        await mongoose.connect(connectionString, {
            dbName: dbName
        });

        console.log(`MongoDB connected to ${dbName} database`);
        return mongoose.connection; // Return the connection
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err; // Re-throw the error to be caught in server.js
    }
};

module.exports = connectDB;

const mongoose = require("mongoose");
const Manager = require("./model/manager");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: './config.env' });

const createTestManager = async () => {
    try {
        // Connect to MongoDB using the same method as the main server
        const dbName = "KFK_STUDIO";
        const connectionString = process.env.ATLAS_URI;

        await mongoose.connect(connectionString, {
            dbName: dbName
        });
        console.log("Connected to MongoDB");

        // Check if manager already exists
        const existingManager = await Manager.findOne({ email: "manager@kfkstudio.com" });
        if (existingManager) {
            console.log("Test manager already exists!");
            return;
        }

        // Create test manager
        const hashedPassword = await bcrypt.hash("manager123", 10);

        const testManager = await Manager.create({
            name: "Test Manager",
            email: "manager@kfkstudio.com",
            password: hashedPassword,
            department: "administration",
            permissions: ["manage-bookings", "manage-services", "manage-customers", "view-reports"]
        });

        console.log("Test manager created successfully!");
        console.log("Email: manager@kfkstudio.com");
        console.log("Password: manager123");
        console.log("Department:", testManager.department);
        console.log("Permissions:", testManager.permissions);

    } catch (error) {
        console.error("Error creating test manager:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

createTestManager();

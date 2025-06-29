const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: './config.env' });

// Import the Customer model
const Customer = require("./model/Customer");

// The email and existing plain text password from your database
const EMAIL = "customer@gmail.com";
const EXISTING_PASSWORD = "customer123"; // This is the plain text password we saw in the database

async function resetCustomerPassword() {
    try {
        // Connect to MongoDB
        const connectionString = process.env.ATLAS_URI.includes('?')
            ? `${process.env.ATLAS_URI.split('?')[0]}/KFK-STUDIO?${process.env.ATLAS_URI.split('?')[1]}`
            : `${process.env.ATLAS_URI}/KFK-STUDIO`;

        await mongoose.connect(connectionString);
        console.log("Connected to MongoDB");

        // Find the Customer by Object ID from your screenshot
        const Customer = await Customer.findOne({ email: EMAIL });

        if (!Customer) {
            console.log(`Customer with email ${EMAIL} not found.`);
            return;
        }

        console.log(`Found Customer: ${Customer.name || 'unnamed'} with email ${EMAIL}`);

        // Hash the existing password that's currently stored as plain text
        const hashed = await bcrypt.hash(EXISTING_PASSWORD, 10);

        // Update the password field with the hashed version
        Customer.password = hashed;

        // Make sure the Customer has a role
        if (!Customer.role) {
            Customer.role = "customer";
        }

        await Customer.save();
        console.log(`Password updated for ${EMAIL}. The plain text password "${EXISTING_PASSWORD}" has been properly hashed.`);
        console.log("You should now be able to log in with customer@gmail.com and password customer123");

        // Disconnect
        await mongoose.disconnect();
        console.log("Done");
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the function
resetCustomerPassword();
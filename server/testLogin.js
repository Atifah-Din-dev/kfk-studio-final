const mongoose = require("mongoose");
const Customer = require("./model/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: './config.env' });

// Test credentials
const TEST_EMAIL = "customer@gmail.com";
const TEST_PASSWORD = "customer123";

// Function to test direct login via MongoDB
async function testDirectLogin() {
    try {
        console.log("==== DIRECT DATABASE LOGIN TEST ====");

        // 1. Connect to MongoDB
        const connectionString = process.env.ATLAS_URI.includes('?')
            ? `${process.env.ATLAS_URI.split('?')[0]}/KFK-STUDIO?${process.env.ATLAS_URI.split('?')[1]}`
            : `${process.env.ATLAS_URI}/KFK-STUDIO`;

        console.log(`Connecting to MongoDB: ${connectionString.split('@')[1]}`); // Show connection without credentials

        await mongoose.connect(connectionString);
        console.log("✅ Connected to MongoDB successfully");

        // 2. Check if the Customer exists
        console.log(`Looking for Customer with email: ${TEST_EMAIL}`);
        const Customer = await Customer.findOne({ email: TEST_EMAIL });

        if (!Customer) {
            console.log(`❌ Customer with email ${TEST_EMAIL} not found in the database`);
            return;
        }

        console.log(`✅ Found Customer: ${Customer.name || 'unnamed'} (${TEST_EMAIL})`);
        console.log(`Customer role: ${Customer.role || 'none'}`);
        console.log(`Password in DB (first few chars): ${Customer.password.substring(0, 10)}...`);

        // 3. Check if the password is hashed
        const isHashed = Customer.password.startsWith('$2') && Customer.password.length > 50;
        if (!isHashed) {
            console.log("❌ Password is NOT properly hashed. This will cause login to fail.");
            console.log("Try running the resetPassword.js script first.");
            return;
        }

        console.log("✅ Password appears to be properly hashed");

        // 4. Test password verification
        console.log(`Testing password verification for: "${TEST_PASSWORD}"`);
        const isMatch = await bcrypt.compare(TEST_PASSWORD, Customer.password);

        if (!isMatch) {
            console.log("❌ Password verification FAILED");
            console.log("The stored password hash does not match the test password");
            return;
        }

        console.log("✅ Password verification successful");

        // 5. Test JWT token generation
        console.log("Testing JWT token generation...");
        if (!process.env.JWT_SECRET) {
            console.log("❌ JWT_SECRET is missing in environment variables");
            return;
        }

        try {
            const token = jwt.sign({ id: Customer._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            console.log("✅ JWT token generated successfully");
            console.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);
        } catch (tokenErr) {
            console.log("❌ JWT token generation FAILED");
            console.log("Error:", tokenErr.message);
            return;
        }

        // 6. All tests passed
        console.log("\n✅✅✅ All authentication tests PASSED");
        console.log("If you're still having login issues, the problem is likely in the client-server communication");

    } catch (error) {
        console.error("Error during test:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

// Run the test
testDirectLogin();
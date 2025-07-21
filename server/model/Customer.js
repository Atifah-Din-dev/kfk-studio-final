// Customer.js
// Model for Customer entity, defining schema and structure for customer data in the database

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'manager'], default: 'customer' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastActive: { type: Date, default: Date.now },
    preferences: {
        rememberMe: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 30 }, // minutes
    },
    profileImage: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customer", customerSchema);
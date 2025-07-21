// manager.js
// Model for Manager entity, defining schema and structure for manager data in the database

const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: "manager",
        enum: ["manager", "admin", "super-admin"]
    },
    department: {
        type: String,
        enum: ["photography", "editing", "customer-service", "administration"],
        required: true
    },
    permissions: [{
        type: String,
        enum: ["manage-bookings", "manage-services", "manage-customers", "view-reports", "manage-staff"]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
managerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Manager", managerSchema);

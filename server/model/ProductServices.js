// server/model/ProductServices.js
// Model for Product Services, defining schema and structure for product service data in the database

const mongoose = require("mongoose");

const productServicesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    },
    options: [{
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        additionalPrice: {
            type: Number,
            default: 0,
        },
        additionalDuration: {
            type: Number,
            default: 0,
        }
    }],
    webArUrl: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    availableDays: {
        type: [String],
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        default: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    availableTimeSlots: [{
        startTime: String,
        endTime: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

productServicesSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("ProductService", productServicesSchema);
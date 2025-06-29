const mongoose = require("mongoose");

const bookingProgressSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookingList",
        required: true,
    },
    steps: [
        {
            step: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum: ["pending", "in-progress", "completed"],
                default: "pending",
            },
            completedAt: {
                type: Date,
            },
            notes: {
                type: String,
            }
        }
    ],
    currentStep: {
        type: Number,
        default: 0,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update the updatedAt field before saving
bookingProgressSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("BookingProgress", bookingProgressSchema);
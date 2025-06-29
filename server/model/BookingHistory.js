const mongoose = require("mongoose");

const bookingHistorySchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookingList",
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    previousStatus: {
        type: String,
    },
    newStatus: {
        type: String,
    },
    additionalData: {
        type: Object,
    }
});

module.exports = mongoose.model("BookingHistory", bookingHistorySchema);
// server/controller/bookingController.js
// Controller for handling booking operations, including creating, updating, and retrieving bookings

const BookingList = require("../model/BookingLists");
const BookingProgress = require("../model/BookingProgress");
const BookingHistory = require("../model/BookingHistory");
const ProductService = require("../model/ProductServices");
const Customer = require("../model/Customer");

exports.createBooking = async (req, res) => {
    try {
        const { service, serviceDetails, date, time, notes, price, totalPrice, orderId, customerInfo } = req.body;
        const CustomerId = req.Customer.id;

        const serviceData = await ProductService.findById(service);
        if (!serviceData) {
            return res.status(404).json({ msg: "Service not found" });
        }

        let finalPrice = price || serviceData.price;
        if (serviceDetails && serviceDetails.options) {
            for (const optionId of serviceDetails.options) {
                const option = serviceData.options.find(opt => opt._id.toString() === optionId);
                if (option) {
                    finalPrice += option.additionalPrice;
                }
            }
        }

        const newBooking = new BookingList({
            Customer: CustomerId,
            service: serviceData._id,
            serviceDetails: {
                ...serviceDetails,
                name: serviceData.name,
                category: serviceData.category,
                description: serviceData.description,
                image: serviceData.image
            },
            date,
            time,
            price: finalPrice,
            totalPrice: totalPrice || finalPrice,
            orderId,
            notes,
            customerInfo
        });

        const booking = await newBooking.save();

        const bookingProgress = new BookingProgress({
            booking: booking._id,
            steps: [
                {
                    step: "Booking Created",
                    description: "Your booking has been successfully created",
                    status: "completed",
                    completedAt: Date.now()
                },
                {
                    step: "Confirmation",
                    description: "Waiting for confirmation from KFK Studio",
                    status: "in-progress"
                },
                {
                    step: "Preparation",
                    description: "KFK Studio is preparing for your service",
                    status: "pending"
                },
                {
                    step: "Service Day",
                    description: "Your service will be delivered",
                    status: "pending"
                },
                {
                    step: "Completion",
                    description: "Service has been completed",
                    status: "pending"
                }
            ],
            currentStep: 1
        });

        await bookingProgress.save();

        const bookingHistory = new BookingHistory({
            booking: booking._id,
            action: "create",
            description: "Booking created by Customer",
            performedBy: CustomerId,
            newStatus: "pending"
        });

        await bookingHistory.save();

        const populatedBooking = {
            ...booking.toObject(),
            serviceDetails: serviceData
        };

        res.status(201).json({
            msg: "Booking created successfully",
            booking: populatedBooking,
            progress: bookingProgress
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getCustomerBookings = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;

        const bookings = await BookingList.find({ Customer: CustomerId })
            .sort({ createdAt: -1 });

        const populatedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const serviceData = await ProductService.findById(booking.service);
                return {
                    ...booking.toObject(),
                    serviceDetails: serviceData
                };
            })
        );

        res.json(populatedBookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const progress = await BookingProgress.findOne({ booking: bookingId });

        const history = await BookingHistory.find({ booking: bookingId })
            .sort({ timestamp: -1 });

        const serviceData = await ProductService.findById(booking.service);
        const populatedBooking = {
            ...booking.toObject(),
            serviceDetails: serviceData
        };

        res.json({
            booking: populatedBooking,
            progress,
            history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const userId = req.manager?.id || req.Customer?.id;
        const { status } = req.body;
        const bookingId = req.params.id;

        const booking = await BookingList.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const previousStatus = booking.status;
        booking.status = status;
        await booking.save();

        res.json({ msg: "Booking status updated", previousStatus, newStatus: status, booking });
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ msg: "Failed to update booking status", error: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        if (booking.status === "completed") {
            return res.status(400).json({ msg: "Cannot cancel a completed booking" });
        }

        const previousStatus = booking.status;
        booking.status = "canceled";
        await booking.save();

        const progress = await BookingProgress.findOne({ booking: bookingId });
        if (progress) {
            progress.isCompleted = true;
            await progress.save();
        }

        const history = new BookingHistory({
            booking: bookingId,
            action: "cancel",
            description: "Booking canceled by " + (Customer.role === "manager" ? "manager" : "Customer"),
            performedBy: CustomerId,
            previousStatus,
            newStatus: "canceled"
        });

        await history.save();

        res.json({
            msg: "Booking canceled successfully",
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;

        const Customer = await Customer.findById(CustomerId);
        if (Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const bookings = await BookingList.find()
            .sort({ createdAt: -1 })
            .populate("Customer", "name email");

        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.addBookingNote = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;
        const { notes } = req.body;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        booking.notes = notes;
        await booking.save();

        const history = new BookingHistory({
            booking: bookingId,
            action: "update_notes",
            description: "Booking notes updated",
            performedBy: CustomerId
        });

        await history.save();

        res.json({
            msg: "Booking notes updated",
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAvailableTimeSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({ msg: "Service ID and date are required" });
        }

        let service = await ProductService.findById(serviceId);

        if (!service) {
            const packageNames = ['Package A', 'Package B', 'Package C', 'Package D'];
            service = await ProductService.findOne({
                name: { $in: packageNames }
            });
        }

        if (!service) {
            return res.status(404).json({ msg: "Service not found" });
        }

        let serviceCategory = service.category;
        if (['Package A', 'Package B', 'Package C', 'Package D'].includes(service.name)) {
            serviceCategory = 'studio';
        }

        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);

        if (serviceCategory?.toLowerCase() === 'studio') {
            const studioStartDate = new Date('2025-11-22');
            const studioEndDate = new Date('2025-11-27');
            studioStartDate.setHours(0, 0, 0, 0);
            studioEndDate.setHours(0, 0, 0, 0);

            if (requestedDate < studioStartDate || requestedDate > studioEndDate) {
                return res.json({
                    availableSlots: [],
                    message: "Studio services are only available from November 22 to November 27, 2025"
                });
            }

            const allSlots = [];
            const startHour = 8;
            const endHour = 19;

            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    allSlots.push(timeString);
                }
            }

            const startOfDay = new Date(requestedDate);
            const endOfDay = new Date(requestedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const bookings = await BookingList.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                'serviceDetails.category': 'studio'
            });

            const bookingsPerSlot = {};
            allSlots.forEach(slot => {
                bookingsPerSlot[slot] = 0;
            });

            bookings.forEach(booking => {
                if (booking.time in bookingsPerSlot) {
                    bookingsPerSlot[booking.time]++;
                }
            });

            const maxCapacity = 3;
            const availableSlots = allSlots.filter(slot => bookingsPerSlot[slot] < maxCapacity);

            return res.json({
                availableSlots,
                message: availableSlots.length > 0 ?
                    "Available time slots for studio services" :
                    "No available time slots for the selected date"
            });
        } else {
            const availableSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

            return res.json({
                availableSlots,
                message: "Available time slots"
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

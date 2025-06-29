const BookingList = require("../model/BookingLists");
const BookingProgress = require("../model/BookingProgress");
const BookingHistory = require("../model/BookingHistory");
const ProductService = require("../model/ProductServices");
const Customer = require("../model/Customer");

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { service, serviceDetails, date, time, notes } = req.body;
        const CustomerId = req.Customer.id;

        // Validate the service
        const serviceData = await ProductService.findById(service);
        if (!serviceData) {
            return res.status(404).json({ msg: "Service not found" });
        }

        // Calculate price based on selected options
        let totalPrice = serviceData.price;
        if (serviceDetails && serviceDetails.options) {
            for (const optionId of serviceDetails.options) {
                const option = serviceData.options.find(opt => opt._id.toString() === optionId);
                if (option) {
                    totalPrice += option.additionalPrice;
                }
            }
        }

        // Create the booking
        const newBooking = new BookingList({
            Customer: CustomerId,
            service: serviceData._id,
            serviceDetails,
            date,
            time,
            price: totalPrice,
            notes
        });

        const booking = await newBooking.save();

        // Create booking progress
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
            currentStep: 1 // Confirmation step is active
        });

        await bookingProgress.save();

        // Record in history
        const bookingHistory = new BookingHistory({
            booking: booking._id,
            action: "create",
            description: "Booking created by Customer",
            performedBy: CustomerId,
            newStatus: "pending"
        });

        await bookingHistory.save();

        res.status(201).json({
            msg: "Booking created successfully",
            booking,
            progress: bookingProgress
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Get all bookings for current Customer
exports.getCustomerBookings = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;

        const bookings = await BookingList.find({ Customer: CustomerId })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Get a single booking by id
exports.getBookingById = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        // Make sure Customer owns the booking (unless admin)
        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        // Get booking progress
        const progress = await BookingProgress.findOne({ booking: bookingId });

        // Get booking history
        const history = await BookingHistory.find({ booking: bookingId })
            .sort({ timestamp: -1 });

        res.json({
            booking,
            progress,
            history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Update booking status (admin/manager only)
exports.updateBookingStatus = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const { status } = req.body;
        const bookingId = req.params.id;

        // Verify Customer is a manager
        const Customer = await Customer.findById(CustomerId);
        if (Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        const booking = await BookingList.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const previousStatus = booking.status;
        booking.status = status;
        await booking.save();

        // Update booking progress based on status
        const progress = await BookingProgress.findOne({ booking: bookingId });

        if (status === "confirmed") {
            // Update to confirmation step
            progress.steps[1].status = "completed";
            progress.steps[1].completedAt = Date.now();
            progress.steps[2].status = "in-progress";
            progress.currentStep = 2;
        } else if (status === "completed") {
            // Complete all steps
            progress.steps.forEach((step, index) => {
                step.status = "completed";
                if (!step.completedAt) {
                    step.completedAt = Date.now();
                }
            });
            progress.currentStep = progress.steps.length - 1;
            progress.isCompleted = true;
        } else if (status === "canceled") {
            progress.isCompleted = true;
        }

        await progress.save();

        // Add to history
        const history = new BookingHistory({
            booking: bookingId,
            action: "update_status",
            description: `Booking status updated from ${previousStatus} to ${status}`,
            performedBy: CustomerId,
            previousStatus,
            newStatus: status
        });

        await history.save();

        res.json({
            msg: "Booking status updated",
            booking,
            progress
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Cancel a booking (Customer can cancel their own booking)
exports.cancelBooking = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        // Make sure Customer owns the booking or is a manager
        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        // Check if booking can be canceled
        if (booking.status === "completed") {
            return res.status(400).json({ msg: "Cannot cancel a completed booking" });
        }

        const previousStatus = booking.status;
        booking.status = "canceled";
        await booking.save();

        // Update progress
        const progress = await BookingProgress.findOne({ booking: bookingId });
        if (progress) {
            progress.isCompleted = true;
            await progress.save();
        }

        // Add to history
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

// Get all bookings (admin/manager only)
exports.getAllBookings = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;

        // Verify Customer is a manager
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

// Add notes to a booking
exports.addBookingNote = async (req, res) => {
    try {
        const CustomerId = req.Customer.id;
        const bookingId = req.params.id;
        const { notes } = req.body;

        const booking = await BookingList.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        // Make sure Customer owns the booking or is a manager
        const Customer = await Customer.findById(CustomerId);
        if (booking.Customer.toString() !== CustomerId && Customer.role !== "manager") {
            return res.status(403).json({ msg: "Not authorized" });
        }

        booking.notes = notes;
        await booking.save();

        // Add to history
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

// Get available time slots for a specific date and service
exports.getAvailableTimeSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({ msg: "Service ID and date are required" });
        }

        // Get the service details
        let service = await ProductService.findById(serviceId);

        // If service not found by ID, try to find by name for studio packages
        if (!service) {
            const packageNames = ['Package A', 'Package B', 'Package C', 'Package D'];
            service = await ProductService.findOne({
                name: { $in: packageNames }
            });
        }

        if (!service) {
            return res.status(404).json({ msg: "Service not found" });
        }

        // Ensure studio packages have the correct category
        let serviceCategory = service.category;
        if (['Package A', 'Package B', 'Package C', 'Package D'].includes(service.name)) {
            serviceCategory = 'studio';
        }

        console.log('Service found:', service.name, 'Category:', serviceCategory);

        // Parse the requested date
        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Special handling for studio category
        if (serviceCategory?.toLowerCase() === 'studio') {
            console.log('Processing studio service - generating 15-minute slots');
            // Check if date is within the allowed range for studio services (Nov 22-27, 2025)
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

            // Generate all time slots for studio services (15-minute intervals from 8:00 AM to 7:00 PM)
            const allSlots = [];
            const startHour = 8; // 8:00 AM
            const endHour = 19; // 7:00 PM

            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    allSlots.push(timeString);
                }
            }

            console.log('Generated', allSlots.length, '15-minute slots for studio service');
            console.log('First few slots:', allSlots.slice(0, 5));

            // Get all bookings for this date and category
            const startOfDay = new Date(requestedDate);
            const endOfDay = new Date(requestedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const bookings = await BookingList.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                'serviceDetails.category': 'studio'
            });

            // Count bookings per time slot
            const bookingsPerSlot = {};
            allSlots.forEach(slot => {
                bookingsPerSlot[slot] = 0;
            });

            bookings.forEach(booking => {
                if (booking.time in bookingsPerSlot) {
                    bookingsPerSlot[booking.time]++;
                }
            });

            // Filter out fully booked slots (3 or more bookings)
            const maxCapacity = 3; // 3 studios available
            const availableSlots = allSlots.filter(slot => bookingsPerSlot[slot] < maxCapacity);

            console.log('Available slots:', availableSlots.length);

            // Return available slots
            return res.json({
                availableSlots,
                message: availableSlots.length > 0 ?
                    "Available time slots for studio services" :
                    "No available time slots for the selected date"
            });
        } else {
            console.log('Processing non-studio service - using default hourly slots');
            // For other service categories, use their standard availability
            // Generate default time slots or use service-specific slots
            const availableSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

            // In a real app, you would also check these against bookings

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
const Manager = require("../model/manager");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
    const { name, email, password, department, permissions } = req.body;

    try {
        console.log('Manager register function called with:', { name, email, department, permissions });

        if (!name || !email || !password || !department) {
            return res.status(400).json({
                msg: "Please provide all required fields",
                missing: {
                    name: !name,
                    email: !email,
                    password: !password,
                    department: !department
                }
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Please provide a valid email address" });
        }

        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ msg: "Manager already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newManager = await Manager.create({
            name,
            email,
            password: hashedPassword,
            department,
            permissions: permissions || ["manage-bookings"]
        });

        console.log('Manager created successfully:', newManager);

        res.status(201).json({ msg: "Manager registered successfully" });
    } catch (err) {
        console.error("Manager registration error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Manager login attempt for: ${email}`);

        if (!email || !password) {
            console.log(`Missing fields: ${!email ? 'email' : ''} ${!password ? 'password' : ''}`);
            return res.status(400).json({
                msg: "Please provide both email and password",
                missing: {
                    email: !email,
                    password: !password
                }
            });
        }

        const manager = await Manager.findOne({ email });
        if (!manager) {
            console.log(`Manager not found: ${email}`);
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        if (!manager.isActive) {
            console.log(`Manager account is deactivated: ${email}`);
            return res.status(400).json({ msg: "Account is deactivated. Please contact administrator." });
        }

        console.log(`Manager found: ${manager.name} (${email}), verifying password...`);

        try {
            const match = await bcrypt.compare(password, manager.password);
            if (!match) {
                console.log(`Password mismatch for: ${email}`);
                return res.status(400).json({ msg: "Invalid credentials" });
            }
        } catch (passwordErr) {
            console.error(`Password comparison error for ${email}:`, passwordErr);
            return res.status(500).json({ msg: "Error verifying credentials", error: passwordErr.message });
        }

        manager.lastLogin = new Date();
        await manager.save();

        console.log(`Manager logged in successfully: ${manager.name} (${email})`);

        let token;
        try {
            token = generateToken(manager._id);
        } catch (tokenErr) {
            console.error(`Token generation error for ${email}:`, tokenErr);
            return res.status(500).json({ msg: "Error generating authentication token", error: tokenErr.message });
        }

        res.json({
            token,
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.email,
                role: manager.role,
                department: manager.department,
                permissions: manager.permissions
            },
        });
    } catch (err) {
        console.error(`Manager login error for ${email}:`, err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

exports.getManagerProfile = async (req, res) => {
    try {
        if (!req.manager || !req.manager.id) {
            return res.status(401).json({ msg: 'Unauthorized: No manager info' });
        }

        const manager = await Manager.findById(req.manager.id).select('-password');
        if (!manager) {
            return res.status(404).json({ msg: 'Manager not found' });
        }

        res.json(manager);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        if (email) {
            const emailExists = await Manager.findOne({ email, _id: { $ne: req.manager.id } });
            if (emailExists) {
                return res.status(400).json({ msg: "Email already in use" });
            }
        }

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;

        const manager = await Manager.findByIdAndUpdate(
            req.manager.id,
            updatedFields,
            { new: true }
        ).select('-password');

        if (!manager) {
            return res.status(404).json({ msg: "Manager not found" });
        }

        res.json(manager);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: "Please provide both current and new password" });
        }

        const manager = await Manager.findById(req.manager.id);
        if (!manager) {
            return res.status(404).json({ msg: "Manager not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, manager.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        manager.password = hashedPassword;
        await manager.save();

        res.json({ msg: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const BookingList = require("../model/BookingLists");
        const Customer = require("../model/Customer");

        const totalBookings = await BookingList.countDocuments();

        const pendingBookings = await BookingList.countDocuments({ status: "pending" });

        const completedBookings = await BookingList.countDocuments({ status: "completed" });

        const revenueResult = await BookingList.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        const totalCustomers = await Customer.countDocuments();

        const recentBookings = await BookingList.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('Customer', 'name')
            .populate('service');

        const recentActivity = recentBookings.map(booking => ({
            time: booking.createdAt,
            description: `New booking received from ${booking.Customer?.name || 'Unknown Customer'}`,
            type: 'booking'
        }));

        res.json({
            stats: {
                totalBookings,
                pendingBookings,
                completedBookings,
                totalRevenue,
                totalCustomers
            },
            recentActivity
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const BookingList = require("../model/BookingLists");
        const ProductService = require("../model/ProductServices");
        const Customer = require("../model/Customer");

        const bookings = await BookingList.find()
            .populate('Customer', 'name email phone')
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
        console.error('Error fetching all bookings:', err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const Customer = require("../model/Customer");
        const BookingList = require("../model/BookingLists");

        const customers = await Customer.find().select('-password').sort({ createdAt: -1 });

        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const bookingCount = await BookingList.countDocuments({ Customer: customer._id });
                const totalSpent = await BookingList.aggregate([
                    { $match: { Customer: customer._id, status: "completed" } },
                    { $group: { _id: null, total: { $sum: "$price" } } }
                ]);

                return {
                    ...customer.toObject(),
                    bookingCount,
                    totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
                };
            })
        );

        res.json(customersWithStats);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const BookingList = require("../model/BookingLists");
        const managerId = req.manager?.id;
        if (!managerId) {
            return res.status(401).json({ msg: "Unauthorized: No manager info" });
        }
        const manager = await Manager.findById(managerId);
        if (!manager) {
            return res.status(404).json({ msg: "Manager not found" });
        }
        const { bookingId, newStatus } = req.body;
        if (!bookingId || !newStatus) {
            return res.status(400).json({ msg: "Missing bookingId or newStatus" });
        }
        const allowedStatus = {
            "studio": ["On-going Session", "Sorting", "Editing Quality Checking (EQC)"],
            "editing": ["Editing"],
            "customer-service": ["Printing Quality Checking (PQC)", "Packaging", "Posting", "Delivered"]
        };
        if (!allowedStatus[manager.department]?.includes(newStatus)) {
            return res.status(403).json({ msg: `Managers in ${manager.department} cannot update status to '${newStatus}'` });
        }
        const booking = await BookingList.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }
        booking.status = newStatus;
        await booking.save();
        res.json({ msg: "Booking status updated", booking });
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

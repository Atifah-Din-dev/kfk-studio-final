const Customer = require("../model/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        console.log('Register function called with:', { name, email, password });

        // Log database connection status
        console.log('Database connection status:', mongoose.connection.readyState);

        // Log before creating a new customer
        console.log('Attempting to create a new customer with:', { name, email });

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                msg: "Please provide all required fields",
                missing: {
                    name: !name,
                    email: !email,
                    password: !password
                }
            });
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Please provide a valid email address" });
        }

        const existing = await Customer.findOne({ email });
        if (existing) return res.status(400).json({ msg: "Customer already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const newCustomer = await Customer.create({ name, email, password: hashed });

        // Log after customer creation
        console.log('Customer created successfully:', newCustomer);

        console.log(`Customer registered successfully: ${name} (${email})`);
        res.status(201).json({ msg: "Customer registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Login attempt for: ${email}`);

        // Validate input fields
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

        // Check if customer exists
        const customer = await Customer.findOne({ email });
        if (!customer) {
            console.log(`Customer not found: ${email}`);
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        console.log(`Customer found: ${customer.name} (${email}), verifying password...`);

        // Verify password
        try {
            const match = await bcrypt.compare(password, customer.password);
            if (!match) {
                console.log(`Password mismatch for: ${email}`);
                return res.status(400).json({ msg: "Invalid credentials" });
            }
        } catch (passwordErr) {
            console.error(`Password comparison error for ${email}:`, passwordErr);
            return res.status(500).json({ msg: "Error verifying credentials", error: passwordErr.message });
        }

        // Update last active timestamp
        customer.lastActive = new Date();
        await customer.save();

        console.log(`Customer logged in successfully: ${customer.name} (${email})`);

        // Generate JWT token
        let token;
        try {
            token = generateToken(customer._id);
        } catch (tokenErr) {
            console.error(`Token generation error for ${email}:`, tokenErr);
            return res.status(500).json({ msg: "Error generating authentication token", error: tokenErr.message });
        }

        res.json({
            token,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                role: customer.role,
                preferences: customer.preferences
            },
        });
    } catch (err) {
        console.error(`Login error for ${email}:`, err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ msg: "Customer not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Set token data in customer document
        customer.resetPasswordToken = resetToken;
        customer.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await customer.save();

        // In a production environment, you would send an email here
        // For now, we'll return the token for demonstration
        console.log(`Reset token generated for ${email}: ${resetToken}`);

        res.json({
            msg: "Password reset link sent to email",
            resetToken // Only for development purposes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Find customer with the provided reset token that hasn't expired
        const customer = await Customer.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        // Hash the new password
        const hashed = await bcrypt.hash(password, 10);

        // Update customer password and clear reset token fields
        customer.password = hashed;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        res.json({ msg: "Password has been reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        // Get customer without password field
        const customer = await Customer.findById(req.customer.id).select('-password');
        if (!customer) {
            return res.status(404).json({ msg: "Customer not found" });
        }
        res.json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        // Check if new email already exists
        if (email) {
            const emailExists = await Customer.findOne({ email, _id: { $ne: req.customer.id } });
            if (emailExists) {
                return res.status(400).json({ msg: "Email already in use" });
            }
        }

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;

        const customer = await Customer.findByIdAndUpdate(
            req.customer.id,
            { $set: updatedFields },
            { new: true }
        ).select('-password');

        res.json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const customer = await Customer.findById(req.customer.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        // Hash new password
        const hashed = await bcrypt.hash(newPassword, 10);
        customer.password = hashed;
        await customer.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

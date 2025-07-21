// server/controller/authController.js
// Controller for handling customer authentication, including registration, login, and password management

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
        console.log('Database connection status:', mongoose.connection.readyState);
        console.log('Attempting to create a new customer with:', { name, email });

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Please provide a valid email address" });
        }

        const existing = await Customer.findOne({ email });
        if (existing) return res.status(400).json({ msg: "Customer already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const newCustomer = await Customer.create({ name, email, password: hashed });

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

        const customer = await Customer.findOne({ email });
        if (!customer) {
            console.log(`Customer not found: ${email}`);
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        console.log(`Customer found: ${customer.name} (${email}), verifying password...`);

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

        customer.lastActive = new Date();
        await customer.save();

        console.log(`Customer logged in successfully: ${customer.name} (${email})`);

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

        const resetToken = crypto.randomBytes(20).toString('hex');

        customer.resetPasswordToken = resetToken;
        customer.resetPasswordExpires = Date.now() + 3600000;
        await customer.save();

        console.log(`Reset token generated for ${email}: ${resetToken}`);

        res.json({
            msg: "Password reset link sent to email",
            resetToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const customer = await Customer.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        const hashed = await bcrypt.hash(password, 10);

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
        if (!req.Customer || !req.Customer.id) {
            return res.status(401).json({ msg: 'Unauthorized: No customer info' });
        }

        const customer = await Customer.findById(req.Customer.id).select('-password');
        if (!customer) {
            return res.status(404).json({ msg: 'Customer not found' });
        }

        res.json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
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

        const isMatch = await bcrypt.compare(currentPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        customer.password = hashed;
        await customer.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }
        const imagePath = `/uploads/profile-images/${req.file.filename}`;
        const customer = await Customer.findByIdAndUpdate(
            req.customer.id,
            { $set: { profileImage: imagePath } },
            { new: true }
        ).select('-password');
        res.json({ msg: "Profile image updated", profileImage: imagePath, customer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

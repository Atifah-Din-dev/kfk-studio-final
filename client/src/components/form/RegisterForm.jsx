// RegisterForm.jsx
// Form component for customer registration, handling input validation and submission

import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../styles/RegisterPage.css";

const RegisterForm = ({ onSubmit, error }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validatePassword = () => {
        if (form.password !== form.confirmPassword) {
            setPasswordError("Passwords do not match");
            return false;
        }
        if (form.password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        const { confirmPassword, ...CustomerData } = form;
        onSubmit(CustomerData);
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2 className="register-title">Create an Account</h2>

            {error && <div className="error-message">{error}</div>}
            {passwordError && <div className="error-message">{passwordError}</div>}

            <div className="input-group">
                <label htmlFor="name" className="input-label">
                    Full Name
                </label>
                <input
                    id="name"
                    name="name"
                    className="input-field"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="email" className="input-label">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    className="input-field"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="password" className="input-label">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    className="input-field"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="confirmPassword" className="input-label">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    className="input-field"
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" className="submit-btn">
                Register
            </button>

            <div className="form-link">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </div>
        </form>
    );
};

RegisterForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default RegisterForm;
// ForgotPasswordPage.jsx
// Page for handling customer forgot password functionality, sending reset link via email

import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";
import "../../styles/ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await authService.forgotPassword(email);
            setMessage(response.msg);
            setIsSubmitted(true);
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(err.response?.data?.msg || "Failed to send reset link");
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form">
                <h2 className="form-title">Reset Password</h2>

                {isSubmitted ? (
                    <div className="success-view">
                        <div className="success-message">{message}</div>
                        <p>Please check your email for further instructions.</p>
                        <div className="form-links">
                            <Link to="/login" className="back-link">Return to Login</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="form-description">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="email" className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input-field"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-btn">Send Reset Link</button>
                        </form>

                        <div className="form-links">
                            <Link to="/login" className="back-link">Back to Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

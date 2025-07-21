// ResetPasswordPage.jsx
// Page for resetting customer password, handling token validation and form submission

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ResetPasswordPage.css";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Get token from URL
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError("Invalid password reset link. Please request a new one.");
        }
    }, [searchParams]);

    const validateForm = () => {
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (!token) {
            setError("Invalid reset token");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await resetPassword(token, password);
            setMessage("Password has been reset successfully!");
            setIsComplete(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to reset password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form">
                <h2 className="form-title">Reset Your Password</h2>

                {isComplete ? (
                    <div className="success-view">
                        <div className="success-message">{message}</div>
                        <p>You will be redirected to the login page shortly...</p>
                        <div className="form-links">
                            <Link to="/login" className="login-link">Go to Login</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="password" className="input-label">New Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="input-field"
                                    placeholder="Create a new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="input-field"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </form>

                        <div className="form-links">
                            <Link to="/login" className="back-link">Back to Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
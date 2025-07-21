import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../styles/LoginPage.css";

const ManagerLoginForm = ({ onSubmit, error }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, password, rememberMe });
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Manager Portal 🔐</h2>
            <p className="login-subtitle">Sign in to access the management dashboard</p>

            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
                <label htmlFor="email" className="input-label">
                    Email
                </label>
                <input
                    id="email"
                    className="input-field"
                    type="email"
                    placeholder="manager@kfkstudio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="password" className="input-label">
                    Password
                </label>
                <input
                    id="password"
                    className="input-field"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="input-options">
                <div className="remember-me">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                </div>
                <div className="forgot-password-link">
                    <Link to="/manager-forgot-password">Forgot password?</Link>
                </div>
            </div>

            <button type="submit" className="submit-btn manager-submit-btn">
                Sign In to Dashboard
            </button>

            <div className="signup-link">
                <span>Not a manager? </span>
                <Link to="/login">Customer Login</Link>
            </div>
        </form>
    );
};

ManagerLoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default ManagerLoginForm;

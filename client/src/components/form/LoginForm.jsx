import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../styles/LoginPage.css";

const LoginForm = ({ onSubmit, error }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, password, rememberMe });
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Welcome To KFK STUDIO! 👋</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
                <label htmlFor="email" className="input-label">
                    Email
                </label>
                <input
                    id="email"
                    className="input-field"
                    type="email"
                    placeholder="your@email.com"
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
                    <Link to="/forgot-password">Forgot password?</Link>
                </div>
            </div>

            <button type="submit" className="submit-btn">
                Login
            </button>

            <div className="signup-link">
                <span>Don't have an account? </span>
                <Link to="/register">Sign up</Link>
            </div>
        </form>
    );
};

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default LoginForm;
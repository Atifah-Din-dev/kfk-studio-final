import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/form/LoginForm";
import "../styles/LoginPage.css";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Display success message if redirected from registration
    const message = location.state?.message || "";

    const handleLogin = async ({ email, password, rememberMe }) => {
        try {
            console.log("Attempting login with:", { email, rememberMe });
            await login({ email, password }, rememberMe);

            // Redirect to the page the Customer was trying to access or default to dashboard
            const redirectPath = location.state?.from || "/dashboard";
            navigate(redirectPath);
        } catch (err) {
            console.error("Login error details:", err);

            // Create detailed error message
            let errorMessage = "Login failed: ";
            if (err.response) {
                errorMessage += err.response.data?.msg || err.response.statusText || "Server error";
                setDebugInfo(`Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                errorMessage += "No response received from server. Check your network connection.";
                setDebugInfo("Request was sent but no response received");
            } else {
                errorMessage += err.message || "Unknown error";
                setDebugInfo(err.stack || "No stack trace available");
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="login-container">
            {message && <div className="success-message">{message}</div>}
            <LoginForm onSubmit={handleLogin} error={error} />
            {debugInfo && (
                <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px', wordBreak: 'break-word' }}>
                    <details>
                        <summary>Debug Info</summary>
                        <pre>{debugInfo}</pre>
                    </details>
                </div>
            )}
        </div>
    );
}

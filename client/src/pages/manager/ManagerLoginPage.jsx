// managerLoginPage.jsx
// Page for manager login, handling authentication and session management

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ManagerLoginForm from "../../components/form/ManagerLoginForm";
import managerAuthService from "../../services/managerAuthService";
import "../../styles/LoginPage.css";

export default function ManagerLoginPage() {
    const [error, setError] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Display success message if redirected from registration
    const message = location.state?.message || "";

    // Check if manager is already logged in
    useEffect(() => {
        if (managerAuthService.checkSessionValidity()) {
            const redirectPath = location.state?.from || "/manager";
            navigate(redirectPath, { replace: true });
        }
    }, [navigate, location.state]);

    const handleLogin = async ({ email, password, rememberMe }) => {
        try {
            console.log("Attempting manager login with:", { email, rememberMe });
            setError("");
            setDebugInfo("");

            const managerData = await managerAuthService.login({ email, password }, rememberMe);

            console.log("Manager login successful:", managerData);

            // Redirect to manager dashboard
            const redirectPath = location.state?.from || "/manager";
            navigate(redirectPath);
        } catch (err) {
            console.error("Manager login error details:", err);

            // Create detailed error message
            let errorMessage = "Manager login failed: ";
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
        <div className="login-container manager-login-container">
            {message && <div className="success-message">{message}</div>}
            <ManagerLoginForm onSubmit={handleLogin} error={error} />
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
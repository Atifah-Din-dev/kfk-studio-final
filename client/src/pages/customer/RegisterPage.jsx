// RegisterPage.jsx
// Page for customer registration, handling form submission and success/error messages

import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RegisterForm from "../../components/form/RegisterForm";
import "../../styles/RegisterPage.css";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleRegister = async (formData) => {
        try {
            setError(""); // Clear any previous errors
            console.log('Attempting registration with:', formData);
            // const response = await axios.post('http://localhost:5000/api/auth/register', formData); // My computer's localhost
            const response = await axios.post('http://10.215.107.23:5000/api/auth/register', formData); // UTM IP address
            // const response = await axios.post('http://192.168.50.212:5000/api/auth/register', formData); // Rumah Nad IP address
            console.log('Registration successful:', response.data);

            // Set success message
            setSuccessMessage("Registration Successful! Redirecting to login page...");

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate('/login', { state: { message: "Registration successful! Please login with your credentials." } });
            }, 2000);
        } catch (error) {
            console.error('Registration error details:', error);
            setError(error.response?.data?.msg || "Registration failed. Please try again.");
            setSuccessMessage(""); // Clear any success message
        }
    };

    return (
        <div className="register-container">
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
            <RegisterForm onSubmit={handleRegister} error={error} />
        </div>
    );
}

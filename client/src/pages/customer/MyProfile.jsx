import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { AccountSidebar } from "./(logged-in)/MyDashboard.jsx";
import "../../styles/MyProfile.css";
import { Link, useLocation } from "react-router-dom";
import "../../styles/MyDashboard.css";

const MyProfile = () => {
    const { Customer, updateProfile } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: '', email: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        if (Customer?.Customer) {
            setForm({
                name: Customer.Customer.name || '',
                email: Customer.Customer.email || ''
            });
        }
    }, [Customer]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEdit = () => setEditMode(true);
    const handleCancel = () => {
        if (Customer?.Customer) {
            setForm({
                name: Customer.Customer.name || '',
                email: Customer.Customer.email || ''
            });
        }
        setEditMode(false);
        setStatus({ loading: false, error: '', success: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ...rest of the code...
    };

    // ...rest of the code...
};

export default MyProfile;

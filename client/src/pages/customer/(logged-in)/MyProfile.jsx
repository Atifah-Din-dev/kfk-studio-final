import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { AccountSidebar } from "./MyDashboard";
import "../../../styles/MyProfile.css";
import { Link, useLocation } from "react-router-dom";
import "../../../styles/MyDashboard.css";

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
        setStatus({ loading: true, error: '', success: '' });
        try {
            await updateProfile(form);
            setStatus({ loading: false, error: '', success: 'Profile updated successfully!' });
            setEditMode(false);
        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.msg || 'Failed to update profile', success: '' });
        }
    };

    return (
        <div className="profile-container">
            <div className="dashboard-layout">
                <AccountSidebar />
                <div className="profile-main">
                    <section className="profile-section">
                        <h2 className="profile-title">My Profile</h2>
                        <form onSubmit={handleSubmit} className="profile-form" autoComplete="off">
                            <div className="input-group">
                                <label htmlFor="name" className="input-label">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    className="input-field"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    readOnly={!editMode}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email" className="input-label">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    className="input-field"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    readOnly={!editMode}
                                    required
                                />
                            </div>
                            {status.error && <div className="error-message">{status.error}</div>}
                            {status.success && <div className="success-message">{status.success}</div>}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                {editMode ? (
                                    <>
                                        <button className="btn primary-btn" type="submit" disabled={status.loading}>
                                            {status.loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="btn cancel-btn" type="button" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn primary-btn" type="button" onClick={handleEdit}>
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;

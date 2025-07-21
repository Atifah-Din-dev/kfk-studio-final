import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import authService from "../../../services/authService";
import "../../../styles/ProfilePage.css";

const ProfilePage = () => {
    const { Customer, updateProfile, changePassword } = useAuth();

    // Profile info state
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: ""
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Session preferences state
    const [preferences, setPreferences] = useState({
        sessionTimeout: 30, // minutes
        rememberMe: false
    });

    // Status state
    const [profileStatus, setProfileStatus] = useState({ loading: false, error: "", success: "" });
    const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: "", success: "" });
    const [prefStatus, setPrefStatus] = useState({ loading: false, error: "", success: "" });

    // Edit mode state
    const [editMode, setEditMode] = useState(false);

    // Section state for sidebar navigation
    const [activeSection, setActiveSection] = useState("profile");

    // Add ref and state for profile image upload
    const fileInputRef = useRef(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [profileImageUploading, setProfileImageUploading] = useState(false);
    const [profileImageError, setProfileImageError] = useState("");

    // Initialize form with Customer data
    useEffect(() => {
        if (Customer?.Customer) {
            setProfileForm({
                name: Customer.Customer.name || "",
                email: Customer.Customer.email || ""
            });

            // If Customer has preference settings, use them
            if (Customer.Customer.preferences) {
                setPreferences({
                    sessionTimeout: Customer.Customer.preferences.sessionTimeout || 30,
                    rememberMe: Customer.Customer.preferences.rememberMe || false
                });
            }
        }
    }, [Customer]);

    // Helper: get profile image (fallback to placeholder)
    const getProfileImage = () => Customer?.Customer?.profileImage || "https://randomuser.me/api/portraits/men/32.jpg";
    const getRole = () => (Customer?.Customer?.role === 'admin' ? 'Admin' : 'Customer');

    // Helper: get full name and email from Customer
    const getFullName = () => Customer?.Customer?.name || "-";
    const getEmail = () => Customer?.Customer?.email || "-";

    // Handle profile form change
    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    // Handle password form change
    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    // Handle preferences change
    const handlePreferenceChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setPreferences({
            ...preferences,
            [e.target.name]: value
        });
    };

    // Submit profile update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileStatus({ loading: true, error: "", success: "" });

        try {
            await updateProfile(profileForm);
            setProfileStatus({
                loading: false,
                error: "",
                success: "Profile updated successfully!"
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setProfileStatus(prev => ({ ...prev, success: "" }));
            }, 3000);
        } catch (err) {
            setProfileStatus({
                loading: false,
                error: err.response?.data?.msg || "Failed to update profile",
                success: ""
            });
        }
    };

    // Submit password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordStatus({ loading: true, error: "", success: "" });

        // Validate passwords match
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordStatus({
                loading: false,
                error: "New passwords do not match",
                success: ""
            });
            return;
        }

        // Validate password length
        if (passwordForm.newPassword.length < 6) {
            setPasswordStatus({
                loading: false,
                error: "Password must be at least 6 characters",
                success: ""
            });
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setPasswordStatus({
                loading: false,
                error: "",
                success: "Password changed successfully!"
            });

            // Clear password form and success message
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                setPasswordStatus(prev => ({ ...prev, success: "" }));
            }, 3000);
        } catch (err) {
            setPasswordStatus({
                loading: false,
                error: err.response?.data?.msg || "Failed to change password",
                success: ""
            });
        }
    };

    // Submit preferences
    const handlePreferencesSubmit = async (e) => {
        e.preventDefault();
        setPrefStatus({ loading: true, error: "", success: "" });

        try {
            // In a real app, you'd save this to the backend
            // Here we'll just simulate success
            setTimeout(() => {
                setPrefStatus({
                    loading: false,
                    error: "",
                    success: "Preferences saved successfully!"
                });

                setTimeout(() => {
                    setPrefStatus(prev => ({ ...prev, success: "" }));
                }, 3000);
            }, 500);
        } catch (err) {
            setPrefStatus({
                loading: false,
                error: "Failed to save preferences",
                success: ""
            });
        }
    };

    // Render profile field helper
    const renderProfileField = (label, name, type = "text") => {
        const isSelect = type === "select";
        const isDate = type === "date";

        return (
            <div className="form-group">
                <label htmlFor={name}>{label}</label>
                {isSelect ? (
                    <select
                        id={name}
                        name={name}
                        value={profileForm[name]}
                        onChange={handleProfileChange}
                        required
                    >
                        <option value="">Select {label}</option>
                        {/* Add options based on the field, e.g., gender, etc. */}
                    </select>
                ) : (
                    <input
                        type={isDate ? "date" : "text"}
                        id={name}
                        name={name}
                        value={profileForm[name]}
                        onChange={handleProfileChange}
                        required
                    />
                )}
            </div>
        );
    };

    // Helper function to calculate age from birthday
    function calculateAge(birthday) {
        if (!birthday) return "-";
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Handle profile image click
    const handleProfileImageClick = () => {
        if (editMode && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle profile image file change
    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileImageError("");
        setProfileImageUploading(true);
        try {
            // Preview image instantly
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            // Upload to server
            const res = await authService.uploadProfileImage(file);
            if (res.profileImage) {
                setProfileImagePreview(null); // Use backend image after upload
                // Optionally update context/profile image here if needed
                window.location.reload(); // Quick way to refresh profile image from backend
            }
        } catch (err) {
            setProfileImageError("Failed to upload image");
        } finally {
            setProfileImageUploading(false);
        }
    };

    return (
        <div className="profile-container">
            <h1 className="profile-title">Account Settings</h1>

            <div className="profile-layout">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="sidebar-title">Account</div>
                    <button className={`sidebar-link${activeSection === "profile" ? " active" : ""}`} onClick={() => setActiveSection("profile")}>My Profile</button>
                    <button className={`sidebar-link${activeSection === "bookings" ? " active" : ""}`} onClick={() => setActiveSection("bookings")}>My Bookings</button>
                    <div className="sidebar-title" style={{ marginTop: '2rem' }}>Settings</div>
                    <button className={`sidebar-link${activeSection === "password" ? " active" : ""}`} onClick={() => setActiveSection("password")}>Change Password</button>
                    <button className={`sidebar-link${activeSection === "preferences" ? " active" : ""}`} onClick={() => setActiveSection("preferences")}>Session Preferences</button>
                </aside>
                <div className="profile-main">
                    {activeSection === "profile" && (
                        <section className="profile-section">
                            <div className="profile-picture-row">
                                <div style={{ position: 'relative', cursor: editMode ? 'pointer' : 'default' }}>
                                    <img
                                        src={profileImagePreview || getProfileImage()}
                                        alt="Profile"
                                        className="profile-picture-large"
                                        onClick={handleProfileImageClick}
                                        style={{ opacity: profileImageUploading ? 0.5 : 1 }}
                                    />
                                    {editMode && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handleProfileImageChange}
                                            />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', background: 'rgba(142,91,232,0.85)', color: '#fff', fontSize: 12, borderRadius: '0 0 50% 50%' }}>
                                                {profileImageUploading ? 'Uploading...' : 'Edit'}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="profile-picture-info">
                                    <div className="profile-picture-name">{getFullName()}</div>
                                    <div className="profile-picture-extra">{getEmail()}</div>
                                </div>
                            </div>
                            {profileImageError && <div className="error-message">{profileImageError}</div>}
                            <h2>General Information</h2>
                            {renderProfileField("Birthday", "birthday", "date")}
                            {renderProfileField("Gender", "gender", "select")}
                            {renderProfileField("Phone", "phone")}
                            <h2 style={{ marginTop: '2rem' }}>Address Information</h2>
                            {renderProfileField("Address", "address")}
                            {renderProfileField("City", "city")}
                            {renderProfileField("State", "state")}
                            {renderProfileField("Country", "country")}
                            {renderProfileField("ZIP Code", "zip")}
                            {editMode ? (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        className="btn primary-btn"
                                        type="submit"
                                        onClick={handleProfileSubmit}
                                        disabled={profileStatus.loading}
                                    >
                                        {profileStatus.loading ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        className="btn cancel-btn"
                                        type="button"
                                        onClick={() => {
                                            setProfileForm(Customer.Customer);
                                            setEditMode(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn primary-btn"
                                    style={{ marginTop: '1.5rem' }}
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                            {profileStatus.error && <div className="error-message">{profileStatus.error}</div>}
                            {profileStatus.success && <div className="success-message">{profileStatus.success}</div>}
                        </section>
                    )}
                    {activeSection === "bookings" && (
                        <section className="profile-section">
                            <h2>My Bookings</h2>
                            <p>Booking list goes here. (You can implement your booking list component here.)</p>
                        </section>
                    )}
                    {activeSection === "password" && (
                        <section className="profile-section">
                            <h2>Change Password</h2>
                            {passwordStatus.error && (
                                <div className="error-message">{passwordStatus.error}</div>
                            )}
                            {passwordStatus.success && (
                                <div className="success-message">{passwordStatus.success}</div>
                            )}
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn primary-btn"
                                    disabled={passwordStatus.loading}
                                >
                                    {passwordStatus.loading ? "Changing..." : "Change Password"}
                                </button>
                            </form>
                        </section>
                    )}
                    {activeSection === "preferences" && (
                        <section className="profile-section">
                            <h2>Session Preferences</h2>
                            {prefStatus.error && (
                                <div className="error-message">{prefStatus.error}</div>
                            )}
                            {prefStatus.success && (
                                <div className="success-message">{prefStatus.success}</div>
                            )}
                            <form onSubmit={handlePreferencesSubmit}>
                                <div className="form-group">
                                    <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                                    <select
                                        id="sessionTimeout"
                                        name="sessionTimeout"
                                        value={preferences.sessionTimeout}
                                        onChange={handlePreferenceChange}
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={120}>2 hours</option>
                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={preferences.rememberMe}
                                        onChange={handlePreferenceChange}
                                    />
                                    <label htmlFor="rememberMe">Remember me on this device</label>
                                </div>
                                <button
                                    type="submit"
                                    className="btn primary-btn"
                                    disabled={prefStatus.loading}
                                >
                                    {prefStatus.loading ? "Saving..." : "Save Preferences"}
                                </button>
                            </form>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
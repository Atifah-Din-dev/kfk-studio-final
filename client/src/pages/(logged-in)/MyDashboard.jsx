import { Link, useLocation } from "react-router-dom";
import "../../styles/MyDashboard.css";


const AccountSidebar = () => {
    const location = useLocation();
    return (
        <aside className="profile-sidebar">
            <div className="sidebar-title">Account</div>
            <Link to="/dashboard" className={`sidebar-link${location.pathname === "/dashboard" ? " active" : ""}`}>My Dashboard</Link>
            <Link to="/profile" className={`sidebar-link${location.pathname === "/profile" ? " active" : ""}`}>My Profile</Link>
            <Link to="/bookings" className={`sidebar-link${location.pathname === "/bookings" ? " active" : ""}`}>My Bookings</Link>
            <div className="sidebar-title" style={{ marginTop: '2rem' }}>Settings</div>
            <Link to="/change-password" className={`sidebar-link${location.pathname === "/change-password" ? " active" : ""}`}>Change Password</Link>
            <Link to="/session-preferences" className={`sidebar-link${location.pathname === "/session-preferences" ? " active" : ""}`}>Session Preferences</Link>
        </aside>
    );
};
const MyDashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-layout">
                <AccountSidebar />
                <div className="dashboard-main">
                    <section className="dashboard-section">
                        <h2>My Dashboard</h2>
                        <p>Welcome to your dashboard! Here you can manage your bookings, profile, and settings.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export { AccountSidebar };
export default MyDashboard;
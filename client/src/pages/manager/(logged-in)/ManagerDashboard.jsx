import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import managerAuthService from "../../../services/managerAuthService";
import "../../../styles/ManagerDashboard.css";

const ManagerDashboard = () => {
    const [manager, setManager] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        totalCustomers: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadManagerData = async () => {
            try {
                if (!managerAuthService.checkSessionValidity()) {
                    navigate('/manager-login');
                    return;
                }

                const managerData = managerAuthService.getManager();
                setManager(managerData);

                try {
                    const dashboardData = await managerAuthService.getDashboardStats();
                    setStats(dashboardData.stats);

                    const formattedActivity = dashboardData.recentActivity.map(activity => ({
                        time: formatTimeAgo(new Date(activity.time)),
                        description: activity.description
                    }));
                    setRecentActivity(formattedActivity);
                } catch (error) {
                    console.error("Error loading dashboard stats:", error);
                    setStats({
                        totalBookings: 0,
                        pendingBookings: 0,
                        completedBookings: 0,
                        totalRevenue: 0,
                        totalCustomers: 0
                    });
                    setRecentActivity([]);
                }

            } catch (error) {
                console.error("Error loading manager data:", error);
                navigate('/manager-login');
            } finally {
                setLoading(false);
            }
        };

        loadManagerData();
    }, [navigate]);

    const handleLogout = () => {
        managerAuthService.logout();
        navigate('/manager-login');
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    if (loading) {
        return <div className="loading">Loading manager dashboard...</div>;
    }

    if (!manager) {
        return <div className="error">Access denied. Please log in as a manager.</div>;
    }

    return (
        <div className="manager-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Manager Dashboard</h1>
                    <div className="manager-info">
                        <span>Welcome, {manager.Manager?.name}</span>
                        <span className="department">({manager.Manager?.department})</span>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-grid">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{stats.totalBookings}</div>
                            <div className="stat-label">Total Bookings</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.pendingBookings}</div>
                            <div className="stat-label">Pending Bookings</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.completedBookings}</div>
                            <div className="stat-label">Completed Bookings</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">RM {stats.totalRevenue.toLocaleString()}</div>
                            <div className="stat-label">Total Revenue</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.totalCustomers}</div>
                            <div className="stat-label">Total Customers</div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-grid">
                            <Link to="/manager/bookings" className="action-card">
                                <div className="action-icon">📅</div>
                                <div className="action-title">Manage Bookings</div>
                                <div className="action-desc">View and manage customer bookings</div>
                            </Link>
                            <Link to="/manager/services" className="action-card">
                                <div className="action-icon">📷</div>
                                <div className="action-title">Manage Services</div>
                                <div className="action-desc">Add, edit, or remove services</div>
                            </Link>
                            <Link to="/manager/(logged-in)/ManagerCustomerPage" className="action-card" style={{ display: 'none' }}></Link>
                            <Link to="/manager/customers" className="action-card">
                                <div className="action-icon">👥</div>
                                <div className="action-title">Customer Management</div>
                                <div className="action-desc">View customer profiles and history</div>
                            </Link>
                            <Link to="/manager/reports" className="action-card">
                                <div className="action-icon">📊</div>
                                <div className="action-title">Reports</div>
                                <div className="action-desc">View analytics and reports</div>
                            </Link>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <h2>Recent Activity</h2>
                        <div className="activity-list">
                            {recentActivity.length === 0 ? (
                                <div className="no-activity">No recent activity</div>
                            ) : (
                                recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-time">{activity.time}</div>
                                        <div className="activity-desc">{activity.description}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManagerDashboard;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import managerAuthService from "../../services/managerAuthService";
import "../../styles/ManagerDashboard.css";

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
                // Check if manager is authenticated
                if (!managerAuthService.checkSessionValidity()) {
                    navigate('/manager-login');
                    return;
                }

                const managerData = managerAuthService.getManager();
                setManager(managerData);

                // Load dashboard statistics from API
                try {
                    const dashboardData = await managerAuthService.getDashboardStats();
                    setStats(dashboardData.stats);

                    // Format recent activity
                    const formattedActivity = dashboardData.recentActivity.map(activity => ({
                        time: formatTimeAgo(new Date(activity.time)),
                        description: activity.description
                    }));
                    setRecentActivity(formattedActivity);
                } catch (err) {
                    // ...handle error...
                }
            } catch (err) {
                // ...handle error...
            } finally {
                setLoading(false);
            }
        };
        loadManagerData();
    }, [navigate]);

    // ...rest of the code...
};

export default ManagerDashboard;

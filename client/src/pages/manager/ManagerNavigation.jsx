import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/Navigation.css";

const ManagerNavigation = () => {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <div className="navbar-section navbar-left">
                <Link to="/manager" className="navbar-logo">
                    <span className="navbar-title">KFK STUDIO Manager</span>
                </Link>
            </div>
            <div className="navbar-section navbar-center">
                <Link to="/manager" className="navbar-link">Dashboard</Link>
                <Link to="/manager/bookings" className="navbar-link">Bookings</Link>
            </div>
            <div className="navbar-section navbar-right">
                {/* Add manager-specific actions here */}
            </div>
        </nav>
    );
};

export default ManagerNavigation;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navigation.css';
import { ReactComponent as Logo } from '../logo.svg';


const Navigation = () => {
    const { isAuthenticated, hasRole } = useAuth();
    const { getCartCount, toggleCart } = useCart();
    const navigate = useNavigate();


    // Determine Home link destination
    let homeLink = '/';
    if (isAuthenticated && hasRole('manager')) {
        homeLink = '/manager';
    } else {
        homeLink = '/';
    }


    return (
        <nav className="navbar">
            <div className="navbar-section navbar-left">
                <Link to="/" className="navbar-logo">
                    {/* <Logo className="logo-svg" /> */}
                    <span className="navbar-title">KFK STUDIO</span>
                </Link>
            </div>
            <div className="navbar-section navbar-center">
                <Link to={homeLink} className="navbar-link">Home</Link>
                <Link to="/services" className="navbar-link">Services</Link>
                <Link to="/about-us" className="navbar-link">About Us</Link>
            </div>
            <div className="navbar-section navbar-right">
                <button className="icon-btn cart-btn" onClick={toggleCart} aria-label="Cart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path d="M7 20c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm10 0c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zM7.334 16h9.334c.828 0 1.54-.672 1.658-1.492l1.334-9.008A1 1 0 0 0 18.667 4H5.333l-.333-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h10v-2H7.334z" fill="currentColor" />
                    </svg>
                    {getCartCount() > 0 && <span className="cart-count">{getCartCount()}</span>}
                </button>
                <Link to="/login" className="icon-btn user-btn" aria-label="User">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </Link>
            </div>
        </nav>
    );
};


export default Navigation;
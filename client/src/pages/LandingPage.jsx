import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";
import packageImg from "../assets/images/packages.png";

// Replace products with categories
const categories = [
    {
        id: "studio",
        title: "Studio",
        description: "Professional studio photography with top-quality equipment and backdrops",
        image: packageImg,
    },
    {
        id: "stage",
        title: "Stage",
        description: "Capture powerful moments during performances and presentations",
        image: packageImg,
    },
    {
        id: "frame",
        title: "Frame",
        description: "Beautiful framing options to preserve your precious memories",
        image: packageImg,
    },
    {
        id: "pre-convocation",
        title: "Pre-convocation",
        description: "Special photography sessions before your graduation ceremony",
        image: packageImg,
    },
    {
        id: "portrait",
        title: "Portrait",
        description: "Stunning portrait photography to highlight your best features",
        image: packageImg,
    },
    {
        id: "event",
        title: "Event",
        description: "Comprehensive coverage for all your special events and celebrations",
        image: packageImg,
    },
];

const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    return (
        <div className="rating">
            {[...Array(fullStars)].map((_, i) => (
                <span key={i}>⭐</span>
            ))}
            {halfStar && <span>⭐</span>}
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleBookNow = () => {
        if (isAuthenticated()) {
            navigate("/booking");
        } else {
            navigate("/login", { state: { from: "/booking" } });
        }
    };

    return (
        <div className="landing-wrapper">
            {/* Hero Section */}
            <section className="hero">
                <h2>
                    Welcome to KFK STUDIO!
                </h2>
                {/* <button onClick={() => navigate("/services")} className="hero-button">Shop Now</button> */}
            </section>

            {/* Book Now Call-to-Action Section */}
            <section className="book-now-section">
                <div className="book-now-content">
                    <h2>Ready to Schedule Your Photo Session?</h2>
                    <p>Book an appointment with our professional photographers today and capture your perfect moments!</p>
                    <button onClick={handleBookNow} className="book-now-cta">
                        BOOK NOW
                    </button>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <h2 className="section-title">Our Photography Categories</h2>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="category-card"
                            onClick={() => navigate(`/services?category=${category.id}`)}
                        >
                            <div className="category-image-container">
                                <img src={category.image} alt={category.title} />
                            </div>
                            <div className="category-content">
                                <h3>{category.title}</h3>
                                <p>{category.description}</p>
                                <button className="view-category-btn">View Services</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

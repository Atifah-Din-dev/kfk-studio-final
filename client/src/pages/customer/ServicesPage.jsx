// client/src/pages/customer/ServicesPage.jsx
// ServicesPage for displaying a list of services with categories and booking options

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api/apiClient";
import "../../styles/ServicesPage.css";

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);

    const categoryOrder = ["studio", "stage", "frame", "pre-convocation", "portrait", "event"];

    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const categoryParam = queryParams.get("category");

        if (categoryParam) {
            setActiveCategory(categoryParam);
        }

        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/services");
                setServices(response.data);

                let predefinedCategories = ["studio", "stage", "frame", "pre-convocation", "portrait", "event"];
                let fetchedCategories = [...new Set(response.data.map(service => service.category))];

                let allCategories = [...new Set([...predefinedCategories, ...fetchedCategories])];

                if (categoryParam && !allCategories.includes(categoryParam)) {
                    setActiveCategory("all");
                }

                setCategories(allCategories);
                setLoading(false);
            } catch (err) {
                setError("Failed to load services. Please try again later.");
                setLoading(false);
            }
        };

        fetchServices();
    }, [location.search]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);

        if (category === "all") {
            navigate("/services");
        } else {
            navigate(`/services?category=${category}`);
        }
    };

    const getFilteredServices = () => {
        if (activeCategory === "all") {
            return sortServicesByCategory(services, categoryOrder);
        }

        const categoryServices = services.filter(service =>
            service.category && service.category.toLowerCase() === activeCategory.toLowerCase()
        );

        if (activeCategory === "studio") {
            return sortServicesByNames(categoryServices, ["Package A", "Package B", "Package C", "Package D"]);
        }
        else if (activeCategory === "stage") {
            return sortServicesByNames(categoryServices, ["Essentials", "Premium", "Deluxe"]);
        }
        else if (activeCategory === "frame") {
            return sortServicesByNames(categoryServices, ["Vertical Frame", "Horizontal Frame"]);
        }
        else if (activeCategory === "pre-convocation") {
            return sortServicesByNames(categoryServices, ["Solo Package", "Duo Package", "Group Package"]);
        }
        else if (activeCategory === "event") {
            return sortServicesByNames(categoryServices, ["Bronze", "Silver", "Gold"]);
        }

        return categoryServices;
    };

    const sortServicesByNames = (services, orderNames) => {
        return [...services].sort((a, b) => {
            const indexA = orderNames.findIndex(name => a.name.includes(name));
            const indexB = orderNames.findIndex(name => b.name.includes(name));

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;

            if (indexB !== -1) return 1;

            return 0;
        });
    };

    const sortServicesByCategory = (services, categoryOrder) => {
        const servicesByCategory = {};

        categoryOrder.forEach(cat => {
            servicesByCategory[cat] = [];
        });

        services.forEach(service => {
            const category = service.category?.toLowerCase() || '';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        });

        Object.keys(servicesByCategory).forEach(category => {
            if (category === "studio") {
                servicesByCategory[category] = sortServicesByNames(
                    servicesByCategory[category],
                    ["Package A", "Package B", "Package C", "Package D"]
                );
            }
            else if (category === "stage") {
                servicesByCategory[category] = sortServicesByNames(
                    servicesByCategory[category],
                    ["Essentials", "Premium", "Deluxe"]
                );
            }
            else if (category === "frame") {
                servicesByCategory[category] = sortServicesByNames(
                    servicesByCategory[category],
                    ["Vertical Frame", "Horizontal Frame"]
                );
            }
            else if (category === "pre-convocation") {
                servicesByCategory[category] = sortServicesByNames(
                    servicesByCategory[category],
                    ["Solo Package", "Duo Package", "Group Package"]
                );
            }
            else if (category === "event") {
                servicesByCategory[category] = sortServicesByNames(
                    servicesByCategory[category],
                    ["Bronze", "Silver", "Gold"]
                );
            }
        });

        const result = [];
        categoryOrder.forEach(category => {
            if (servicesByCategory[category]) {
                result.push(...servicesByCategory[category]);
            }
        });

        Object.keys(servicesByCategory).forEach(category => {
            if (!categoryOrder.includes(category)) {
                result.push(...servicesByCategory[category]);
            }
        });

        return result;
    };

    const filteredServices = getFilteredServices();

    if (loading) {
        return (
            <div className="services-loading">
                <div className="spinner"></div>
                <p>Loading services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="services-error">
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
            </div>
        );
    }

    const handleBookNowClick = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    return (
        <div className="services-page">
            <div className="services-layout">
                <div className="services-sidebar">
                    <div className="sidebar-header">
                        <h3>Categories</h3>
                    </div>
                    <div className="sidebar-categories">
                        <button
                            className={`sidebar-category ${activeCategory === "all" ? "active" : ""}`}
                            onClick={() => handleCategoryChange("all")}
                        >
                            All Services
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`sidebar-category ${activeCategory === category ? "active" : ""}`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category && typeof category === 'string'
                                    ? category.charAt(0).toUpperCase() + category.slice(1)
                                    : 'Unknown Category'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="services-main-content">
                    <header className="services-header">
                        <h1>Our Services</h1>
                        <p>Choose from our range of professional photography and videography services</p>
                    </header>
                    <div className="services-grid">
                        {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                                <div className="service-card" key={service._id}>
                                    {service.image && (
                                        <div className="service-image">
                                            {(() => {
                                                let imageUrl = service.image;
                                                if (imageUrl.startsWith('/uploads/')) {
                                                    imageUrl = `http://10.215.107.23:5000${imageUrl}`;
                                                }
                                                return <img src={imageUrl} alt={service.name} />;
                                            })()}
                                        </div>
                                    )}
                                    <div className="service-content">
                                        <h3>{service.name}</h3>
                                        <span className="service-category">{service.category}</span>
                                        <p className="service-description">{service.description}</p>
                                        <div className="service-footer">
                                            <span className="service-price">
                                                {service.priceFormatted || `RM${service.price.toFixed(2)}`}
                                            </span>
                                            <div className="service-actions">
                                                {(service.name === 'Horizontal Frame' || service.name === 'Vertical Frame') && (
                                                    <button
                                                        onClick={() => window.open('https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305', '_blank')}
                                                        className="zoom-btn-small"
                                                        title="View in 3D/AR"
                                                    >
                                                        🔍
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleBookNowClick(service._id)}
                                                    className="book-now-btn"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-services">
                                <p>No services found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;

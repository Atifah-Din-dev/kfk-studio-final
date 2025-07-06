import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/api/apiClient";
import "../styles/ServicesPage.css";

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [categories, setCategories] = useState([]);

    // Define the category order for "All Services" view
    const categoryOrder = ["studio", "stage", "frame", "pre-convocation", "portrait", "event"];

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Extract category from URL parameters if available
        const queryParams = new URLSearchParams(location.search);
        const categoryParam = queryParams.get("category");

        if (categoryParam) {
            setActiveCategory(categoryParam);
        }

        const fetchServices = async () => {
            try {
                setLoading(true);
                console.log("Attempting to fetch services from API...");
                const response = await apiClient.get("/services");
                console.log("Services API Response:", response.data);
                setServices(response.data);

                // Extract unique categories and add predefined categories
                let predefinedCategories = ["studio", "stage", "frame", "pre-convocation", "portrait", "event"];
                let fetchedCategories = [...new Set(response.data.map(service => service.category))];
                console.log("Fetched categories:", fetchedCategories);

                // Combine and deduplicate categories
                let allCategories = [...new Set([...predefinedCategories, ...fetchedCategories])];
                console.log("All categories:", allCategories);

                // If the active category from URL isn't in our categories, default to "all"
                if (categoryParam && !allCategories.includes(categoryParam)) {
                    setActiveCategory("all");
                }

                setCategories(allCategories);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching services:", err);
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError("Failed to load services. Please try again later.");
                setLoading(false);
            }
        };

        fetchServices();
    }, [location.search]);

    // Update URL when category changes
    const handleCategoryChange = (category) => {
        setActiveCategory(category);

        // Update URL with the selected category
        if (category === "all") {
            navigate("/services");
        } else {
            navigate(`/services?category=${category}`);
        }
    };

    // Get filtered services based on active category
    const getFilteredServices = () => {
        if (activeCategory === "all") {
            // For "All Services", sort by the specified category order
            return sortServicesByCategory(services, categoryOrder);
        }

        // Filter services by the selected category
        const categoryServices = services.filter(service =>
            service.category && service.category.toLowerCase() === activeCategory.toLowerCase()
        );

        // Sort services based on the category
        if (activeCategory === "studio") {
            // Order: Package A, Package B, Package C, Package D
            return sortServicesByNames(categoryServices, ["Package A", "Package B", "Package C", "Package D"]);
        }
        else if (activeCategory === "stage") {
            // Order: Essentials, Premium, Deluxe
            return sortServicesByNames(categoryServices, ["Essentials", "Premium", "Deluxe"]);
        }
        else if (activeCategory === "frame") {
            // Order: Vertical Frame, Horizontal Frame
            return sortServicesByNames(categoryServices, ["Vertical Frame", "Horizontal Frame"]);
        }
        else if (activeCategory === "pre-convocation") {
            // Order: Solo Package, Duo Package, Group Package
            return sortServicesByNames(categoryServices, ["Solo Package", "Duo Package", "Group Package"]);
        }
        else if (activeCategory === "event") {
            // Order: Bronze, Silver, Gold
            return sortServicesByNames(categoryServices, ["Bronze", "Silver", "Gold"]);
        }

        return categoryServices;
    };

    // Helper function to sort services by specified name order
    const sortServicesByNames = (services, orderNames) => {
        return [...services].sort((a, b) => {
            const indexA = orderNames.findIndex(name => a.name.includes(name));
            const indexB = orderNames.findIndex(name => b.name.includes(name));

            // If both services are found in the order list
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            // If only service A is in the order list
            if (indexA !== -1) return -1;

            // If only service B is in the order list
            if (indexB !== -1) return 1;

            // If neither are in the order list, maintain original order
            return 0;
        });
    };

    // New helper function to sort services by category order and then by name within each category
    const sortServicesByCategory = (services, categoryOrder) => {
        // First, group services by category
        const servicesByCategory = {};

        // Initialize empty arrays for each category to maintain order
        categoryOrder.forEach(cat => {
            servicesByCategory[cat] = [];
        });

        // Group services into their respective categories
        services.forEach(service => {
            const category = service.category?.toLowerCase() || '';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        });

        // Sort each category's services by their specific order
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

        // Flatten the groups back into a single array, maintaining category order
        const result = [];
        categoryOrder.forEach(category => {
            if (servicesByCategory[category]) {
                result.push(...servicesByCategory[category]);
            }
        });

        // Append any services from categories not in the specified order
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

    // Handle viewing service details - no authentication required
    const handleViewDetailsClick = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    return (
        <div className="services-page">
            <div className="services-layout">
                {/* Sidebar with categories */}
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

                {/* Main content area */}
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
                                            <img src={service.image} alt={service.name} />
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
                                            <button
                                                onClick={() => handleViewDetailsClick(service._id)}
                                                className="book-now-btn"
                                            >
                                                View Details
                                            </button>
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
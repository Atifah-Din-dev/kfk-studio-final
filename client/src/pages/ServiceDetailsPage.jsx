import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookingForm from "../components/form/BookingForm";
import ShoppingCart from "../components/ShoppingCart";
import apiClient from "../services/api/apiClient";
import "../styles/ServiceDetailsPage.css";

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showBookingForm, setShowBookingForm] = useState(false);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/services/${id}`);
                setService(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching service details:", err);
                setError("Failed to load service details. Please try again later.");
                setLoading(false);
            }
        };

        fetchServiceDetails();
    }, [id]);

    const handleBookNow = () => {
        setShowBookingForm(true);
    };

    const handleCloseBookingForm = () => {
        setShowBookingForm(false);
    };

    if (loading) {
        return (
            <div className="service-details-loading">
                <div className="spinner"></div>
                <p>Loading service details...</p>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="service-details-error">
                <h2>Oops! Something went wrong</h2>
                <p>{error || "Service not found."}</p>
                <button onClick={() => navigate("/services")} className="back-btn">
                    Back to Services
                </button>
            </div>
        );
    }

    return (
        <div className="service-details-container">
            <div className="service-details-header">
                <button onClick={() => navigate("/services")} className="back-button">
                    &larr; Back to Services
                </button>
            </div>

            <div className="service-details-content">
                <div className="service-details-image-container">
                    {service.image ? (
                        <img src={service.image} alt={service.name} className="service-details-image" />
                    ) : (
                        <div className="service-details-image-placeholder">
                            <span>No image available</span>
                        </div>
                    )}
                </div>

                <div className="service-details-info">
                    <h1 className="service-details-title">{service.name}</h1>
                    <div className="service-details-meta">
                        <span className="service-details-category">{service.category}</span>
                        <span className="service-details-price">RM{service.price.toFixed(2)}</span>
                    </div>

                    <div className="service-details-description">
                        <h2>Service Description</h2>
                        <p>{service.description}</p>
                    </div>

                    <div className="service-details-duration">
                        <h2>Duration</h2>
                        <p>
                            {service.category?.toLowerCase() === 'studio'
                                ? '15 minutes'
                                : `${service.duration} minutes`}
                        </p>
                    </div>

                    {service.options && service.options.length > 0 && (
                        <div className="service-details-options">
                            <h2>Available Options</h2>
                            <ul className="options-list">
                                {service.options.map((option, index) => (
                                    <li key={index} className="option-item">
                                        <div className="option-name">{option.name}</div>
                                        <div className="option-description">{option.description}</div>
                                        <div className="option-price">
                                            {option.additionalPrice > 0 ?
                                                `+RM${option.additionalPrice.toFixed(2)}` :
                                                'Included'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="service-details-availability">
                        <h2>Availability</h2>
                        <p>Available on: {service.availableDays?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ") || "Weekdays"}</p>
                    </div>

                    <button onClick={handleBookNow} className="book-service-btn">
                        Book this Service
                    </button>
                </div>
            </div>

            {/* Booking Form Overlay */}
            {showBookingForm && (
                <div className="booking-form-overlay">
                    <BookingForm
                        service={service}
                        onClose={handleCloseBookingForm}
                    />
                </div>
            )}

            {/* Shopping Cart Component */}
            <ShoppingCart />
        </div>
    );
};

export default ServiceDetailsPage;
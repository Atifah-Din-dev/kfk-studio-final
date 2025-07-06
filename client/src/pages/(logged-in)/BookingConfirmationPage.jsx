import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bookingService from "../../services/bookingService";
import "../../styles/BookingConfirmationPage.css";

const BookingConfirmationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login", { state: { from: `/booking/confirmation/${id}` } });
        }
    }, [isAuthenticated, navigate, id]);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getBookingById(id);
                setBookingData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching booking details:", err);
                setError("Failed to load booking details. Please try again later.");
                setLoading(false);
            }
        };

        if (isAuthenticated() && id) {
            fetchBookingDetails();
        }
    }, [id, isAuthenticated]);

    // Format date string for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Get status class for styling
    const getStatusClass = (status) => {
        switch (status) {
            case "confirmed":
                return "status-confirmed";
            case "completed":
                return "status-completed";
            case "canceled":
                return "status-cancelled";
            default:
                return "status-pending";
        }
    };

    // Format step status for display
    const getStepStatus = (step) => {
        switch (step.status) {
            case "completed":
                return { text: "Completed", icon: "✓" };
            case "in-progress":
                return { text: "In Progress", icon: "►" };
            default:
                return { text: "Pending", icon: "○" };
        }
    };

    if (loading) {
        return (
            <div className="confirmation-loading">
                <div className="spinner"></div>
                <p>Loading booking details...</p>
            </div>
        );
    }

    if (error || !bookingData) {
        return (
            <div className="confirmation-error">
                <h2>Oops! Something went wrong</h2>
                <p>{error || "Booking not found."}</p>
                <div className="error-actions">
                    <button
                        onClick={() => window.location.reload()}
                        className="try-again-btn"
                    >
                        Try Again
                    </button>
                    <Link to="/dashboard" className="go-dashboard-btn">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { booking, progress, history } = bookingData;

    return (
        <div className="confirmation-container">
            <div className="confirmation-header">
                <div className="confirmation-icon">✓</div>
                <h1>Booking Confirmed!</h1>
                <p>
                    Your booking has been successfully created and is pending confirmation.
                    We'll notify you once it's confirmed.
                </p>
            </div>

            <div className="confirmation-details">
                <div className="confirmation-section">
                    <h2>Booking Details</h2>

                    <div className="detail-item">
                        <div className="detail-label">Booking ID:</div>
                        <div className="detail-value">{booking._id}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Status:</div>
                        <div className={`detail-value ${getStatusClass(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Service:</div>
                        <div className="detail-value">
                            {booking.serviceDetails?.name || "Photography Service"}
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Date:</div>
                        <div className="detail-value">{formatDate(booking.date)}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Time:</div>
                        <div className="detail-value">{booking.time}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">Price:</div>
                        <div className="detail-value price">
                            ${booking.price?.toFixed(2) || "0.00"}
                        </div>
                    </div>

                    {booking.notes && (
                        <div className="detail-item">
                            <div className="detail-label">Notes:</div>
                            <div className="detail-value notes">{booking.notes}</div>
                        </div>
                    )}
                </div>

                {progress && (
                    <div className="confirmation-section">
                        <h2>Booking Progress</h2>
                        <div className="progress-tracker">
                            {progress.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`progress-step ${step.status}`}
                                >
                                    <div className="step-number">
                                        {index + 1}
                                    </div>
                                    <div className="step-content">
                                        <h3>{step.step}</h3>
                                        <p>{step.description}</p>
                                        {step.completedAt && (
                                            <span className="step-time">
                                                {new Date(step.completedAt).toLocaleDateString()} at{" "}
                                                {new Date(step.completedAt).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="confirmation-notice">
                <p>
                    <strong>Important:</strong> You will receive a confirmation email
                    shortly with all the details of your booking. If you have any questions
                    or need to make changes, please contact us as soon as possible.
                </p>
            </div>

            <div className="confirmation-actions">
                <Link to="/dashboard" className="action-btn primary">
                    View My Bookings
                </Link>
                <Link to="/services" className="action-btn secondary">
                    Browse More Services
                </Link>
            </div>
        </div>
    );
};

export default BookingConfirmationPage;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import '../styles/BookingLists.css';

const BookingLists = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [expandedBooking, setExpandedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await bookingService.getCustomerBookings();
                setBookings(response);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Failed to load your bookings. Please try again later.');
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await bookingService.cancelBooking(bookingId);

            // Update the booking status in the UI without refetching
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking._id === bookingId
                        ? { ...booking, status: 'canceled' }
                        : booking
                )
            );
        } catch (err) {
            console.error('Error canceling booking:', err);
            alert('Failed to cancel booking. Please try again later.');
        }
    };

    const toggleExpand = (bookingId) => {
        setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') {
            return ['pending', 'confirmed'].includes(booking.status);
        } else if (activeTab === 'completed') {
            return booking.status === 'completed';
        } else if (activeTab === 'canceled') {
            return booking.status === 'canceled';
        }
        return true; // 'all' tab
    });

    if (loading) {
        return (
            <div className="booking-lists-loading">
                <div className="spinner"></div>
                <p>Loading your bookings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-lists-error">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="booking-lists-container">
            <div className="booking-lists-header">
                <h2>Your Bookings</h2>
                <div className="booking-tabs">
                    <button
                        className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                    <button
                        className={`tab ${activeTab === 'canceled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('canceled')}
                    >
                        Canceled
                    </button>
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="no-bookings">
                    <p>
                        {activeTab === 'upcoming'
                            ? "You don't have any upcoming bookings."
                            : activeTab === 'completed'
                                ? "You don't have any completed bookings."
                                : activeTab === 'canceled'
                                    ? "You don't have any canceled bookings."
                                    : "You don't have any bookings."}
                    </p>
                    <Link to="/services" className="book-now-link">
                        Book a Service Now
                    </Link>
                </div>
            ) : (
                <div className="booking-cards">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className={`booking-card ${expandedBooking === booking._id ? 'expanded' : ''}`}
                        >
                            <div
                                className="booking-card-header"
                                onClick={() => toggleExpand(booking._id)}
                            >
                                <div className="booking-service">
                                    <h3>{booking.serviceDetails?.name || booking.service}</h3>
                                    <span className={`booking-status ${booking.status}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="booking-meta">
                                    <div className="booking-date">
                                        {formatDate(booking.date)} at {booking.time}
                                    </div>
                                    <div className="booking-expand-icon">
                                        {expandedBooking === booking._id ? '▼' : '▶'}
                                    </div>
                                </div>
                            </div>

                            <div className="booking-card-details">
                                <div className="booking-detail-row">
                                    <span className="detail-label">Booking ID:</span>
                                    <span className="detail-value">{booking._id}</span>
                                </div>

                                <div className="booking-detail-row">
                                    <span className="detail-label">Date & Time:</span>
                                    <span className="detail-value">
                                        {formatDate(booking.date)} at {booking.time}
                                    </span>
                                </div>

                                {booking.serviceDetails?.options && booking.serviceDetails.options.length > 0 && (
                                    <div className="booking-detail-row">
                                        <span className="detail-label">Options:</span>
                                        <span className="detail-value">
                                            {booking.serviceDetails.options.join(", ")}
                                        </span>
                                    </div>
                                )}

                                {booking.price && (
                                    <div className="booking-detail-row">
                                        <span className="detail-label">Price:</span>
                                        <span className="detail-value">${booking.price.toFixed(2)}</span>
                                    </div>
                                )}

                                {booking.notes && (
                                    <div className="booking-detail-row">
                                        <span className="detail-label">Notes:</span>
                                        <span className="detail-value">{booking.notes}</span>
                                    </div>
                                )}

                                <div className="booking-actions">
                                    <Link
                                        to={`/booking/confirmation/${booking._id}`}
                                        className="view-details-btn"
                                    >
                                        View Details
                                    </Link>

                                    {['pending', 'confirmed'].includes(booking.status) && (
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="cancel-booking-btn"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}

                                    {booking.status === 'completed' && (
                                        <Link
                                            to={`/feedback/${booking._id}`}
                                            className="leave-feedback-btn"
                                        >
                                            Leave Feedback
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingLists;
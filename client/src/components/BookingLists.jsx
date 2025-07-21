// client/src/components/BookingLists.jsx
// Component for displaying a list of bookings with options to view, cancel, and filter bookings

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

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') {
            return ['pending', 'confirmed'].includes(booking.status);
        } else if (activeTab === 'completed') {
            return booking.status === 'completed';
        } else if (activeTab === 'canceled') {
            return booking.status === 'canceled';
        }
        return true;
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
                    <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                    <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
                    <button className={`tab ${activeTab === 'canceled' ? 'active' : ''}`} onClick={() => setActiveTab('canceled')}>Canceled</button>
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
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
                <table className="booking-lists-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Options</th>
                            <th>Price (RM)</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking._id}</td>
                                <td>{booking.serviceDetails?.name || booking.service}</td>
                                <td>{formatDate(booking.date)}</td>
                                <td>{booking.time}</td>
                                <td>{booking.serviceDetails?.options ? booking.serviceDetails.options.join(", ") : '-'}</td>
                                <td>{booking.price ? booking.price.toFixed(2) : '-'}</td>
                                <td className={`booking-status ${booking.status}`}>{booking.status}</td>
                                <td>{booking.notes || '-'}</td>
                                <td>
                                    <Link to={`/booking/confirmation/${booking._id}`} className="view-details-btn">View</Link>
                                    {['pending', 'confirmed'].includes(booking.status) && (
                                        <button onClick={() => handleCancelBooking(booking._id)} className="cancel-booking-btn">Cancel</button>
                                    )}
                                    {booking.status === 'completed' && (
                                        <Link to={`/feedback/${booking._id}`} className="leave-feedback-btn">Feedback</Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BookingLists;
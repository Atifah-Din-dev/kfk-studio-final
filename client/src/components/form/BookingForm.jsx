// client/src/components/form/BookingForm.jsx
// BookingForm component for selecting service booking details like date, time, and options

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import "../../styles/BookingForm.css";

const BookingForm = ({ service, onClose }) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    const studioStartDate = new Date('2025-11-22');
    const studioEndDate = new Date('2025-11-27');

    const isStudioCategory = service.category?.toLowerCase() === 'studio';

    const availableDays = service.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday"];

    useEffect(() => {
        if (isStudioCategory) {
            const dates = [];
            const currentDate = new Date(studioStartDate);

            while (currentDate <= studioEndDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            setAvailableDates(dates);
        }
    }, [isStudioCategory]);

    useEffect(() => {
        if (bookingDate) {
            fetchAvailableTimeSlots();
        }
    }, [bookingDate]);

    const fetchAvailableTimeSlots = async () => {
        try {
            setLoading(true);

            const response = await bookingService.getAvailableTimeSlots(
                service._id,
                bookingDate
            );

            if (response && response.availableSlots) {
                if (isStudioCategory) {
                    const formattedSlots = response.availableSlots.map(slot => {
                        const [hours, minutes] = slot.split(':').map(Number);

                        let endHours = hours;
                        let endMinutes = minutes + 15;

                        if (endMinutes >= 60) {
                            endHours += 1;
                            endMinutes -= 60;
                        }

                        const formatTime = (h, m) => {
                            const period = h >= 12 ? 'PM' : 'AM';
                            const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                            const displayMinute = m.toString().padStart(2, '0');
                            return `${displayHour}.${displayMinute}${period}`;
                        };

                        return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;
                    });

                    setAvailableTimeSlots(formattedSlots);
                } else {
                    setAvailableTimeSlots(response.availableSlots);
                }

                if (response.availableSlots.length === 0 && response.message) {
                    setError(response.message);
                } else {
                    setError("");
                }
            } else {
                const defaultTimeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
                setAvailableTimeSlots(defaultTimeSlots);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching time slots:", error);
            setError("Failed to load available time slots");
            setLoading(false);

            const defaultTimeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
            setAvailableTimeSlots(defaultTimeSlots);
        }
    };

    const handleOptionToggle = (optionId) => {
        setSelectedOptions(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                return [...prev, optionId];
            }
        });
    };

    const calculateTotalPrice = () => {
        let total = service.price;

        if (service.options && selectedOptions.length > 0) {
            service.options.forEach(option => {
                if (selectedOptions.includes(option._id)) {
                    total += option.additionalPrice;
                }
            });
        }

        return total;
    };

    const handleAddToCart = () => {
        if (!bookingDate || !bookingTime) {
            setError("Please select both date and time");
            return;
        }

        if (!isAuthenticated) {
            setError("Please login to add items to cart");
            setTimeout(() => {
                onClose();
                navigate('/login', {
                    state: {
                        from: `/services/${service._id}`,
                        message: "Please login to book this service"
                    }
                });
            }, 1500);
            return;
        }

        const selectedOptionNames = service.options
            ? service.options
                .filter(option => selectedOptions.includes(option._id))
                .map(option => option.name)
            : [];

        let time = bookingTime;
        if (isStudioCategory && bookingTime.includes('-')) {
            time = bookingTime.split('-')[0].trim();
        }

        const bookingItem = {
            serviceId: service._id,
            serviceName: service.name,
            category: service.category,
            bookingDate,
            bookingTime: time,
            selectedOptions: selectedOptionNames,
            price: calculateTotalPrice(),
            duration: isStudioCategory ? "15 minutes" : service.duration
        };

        addToCart(bookingItem);
        onClose();
    };

    const isDateAvailable = (dateString) => {
        const date = new Date(dateString);

        if (isStudioCategory) {
            return date >= studioStartDate && date <= studioEndDate;
        }

        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return availableDays.includes(dayOfWeek);
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        if (!isDateAvailable(selectedDate)) {
            if (isStudioCategory) {
                setError(`Studio services are only available from November 22 to November 27, 2025`);
            } else {
                setError(`This service is not available on ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s`);
            }
            setBookingDate("");
        } else {
            setError("");
            setBookingDate(selectedDate);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date instanceof Date
            ? date.toLocaleDateString(undefined, options)
            : new Date(date).toLocaleDateString(undefined, options);
    };

    return (
        <div className="booking-form">
            <div className="booking-form-header">
                <h2>Book Your Appointment</h2>
                <button className="close-form-btn" onClick={onClose}>×</button>
            </div>

            <div className="booking-form-body">
                {error && <div className="booking-error">{error}</div>}

                <div className="form-group">
                    <label htmlFor="bookingDate">Select Date:</label>
                    {isStudioCategory ? (
                        <select
                            id="bookingDate"
                            value={bookingDate}
                            onChange={(e) => {
                                setError("");
                                setBookingDate(e.target.value);
                            }}
                            required
                        >
                            <option value="">Select a date</option>
                            {availableDates.map((date, index) => (
                                <option key={index} value={date.toISOString().split('T')[0]}>
                                    {formatDate(date)}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="date"
                            id="bookingDate"
                            value={bookingDate}
                            onChange={handleDateChange}
                            min={today}
                            required
                        />
                    )}

                    {isStudioCategory && (
                        <p className="date-note">
                            Studio services are only available from November 22 to November 27, 2025
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="bookingTime">
                        Select Time:
                        {isStudioCategory && bookingDate && (
                            <span className="time-note"> (15-minute slots available)</span>
                        )}
                    </label>
                    {loading ? (
                        <div className="loading-slots">Loading available times...</div>
                    ) : (
                        <select
                            id="bookingTime"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            disabled={!bookingDate}
                            required
                        >
                            <option value="">Select a time</option>
                            {availableTimeSlots.map((time, index) => (
                                <option key={index} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {service.options && service.options.length > 0 && (
                    <div className="form-group">
                        <label>Additional Options:</label>
                        <div className="options-list">
                            {service.options.map(option => (
                                <div key={option._id} className="option-item">
                                    <label className="option-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedOptions.includes(option._id)}
                                            onChange={() => handleOptionToggle(option._id)}
                                        />
                                        <span className="option-name">{option.name}</span>
                                        <span className="option-price">
                                            {option.additionalPrice > 0
                                                ? `+RM${option.additionalPrice.toFixed(2)}`
                                                : 'Included'}
                                        </span>
                                    </label>
                                    <p className="option-description">{option.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div className="summary-row">
                        <span>Service:</span>
                        <span>{service.name}</span>
                    </div>
                    {bookingDate && (
                        <div className="summary-row">
                            <span>Date:</span>
                            <span>{formatDate(bookingDate)}</span>
                        </div>
                    )}
                    {bookingTime && (
                        <div className="summary-row">
                            <span>Time:</span>
                            <span>{bookingTime}</span>
                        </div>
                    )}
                    <div className="summary-row">
                        <span>Duration:</span>
                        <span>{isStudioCategory ? "15 minutes" : service.duration}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Price:</span>
                        <span>RM{calculateTotalPrice().toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="booking-form-footer">
                <button className="cancel-btn" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!bookingDate || !bookingTime}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default BookingForm;

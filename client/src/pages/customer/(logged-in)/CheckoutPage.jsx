// client/src/pages/customer/(logged-in)/CheckoutPage.jsx
// Checkout page for the customer, allowing them to review their cart and place an order

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import bookingService from '../../../services/bookingService';
import '../../../styles/CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { cart, getCartTotal, clearCart } = useCart();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'credit-card',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [createdBookings, setCreatedBookings] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (cart.length === 0 && !orderPlaced) {
            navigate('/services');
        }
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
            }));
        }
    }, [cart, navigate, isAuthenticated, user, orderPlaced]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }
        if (formData.paymentMethod === 'credit-card') {
            if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
                setError('Please fill in all payment details');
                return;
            }
        }
        try {
            setLoading(true);
            setError('');
            const mockOrderId = 'ORD-' + Date.now().toString().slice(-8);
            const totalBeforeClear = getCartTotal();
            setTotalAmount(totalBeforeClear);
            setOrderId(mockOrderId);
            const bookingPromises = cart.map(async (item) => {
                const bookingData = {
                    service: item.serviceId,
                    date: item.bookingDate,
                    time: item.bookingTime,
                    price: item.price,
                    totalPrice: totalBeforeClear,
                    totalPrice: getCartTotal(),
                    orderId: mockOrderId,
                    customerInfo: {
                        name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address
                    }
                };
                const createdBooking = await bookingService.createBooking(bookingData);
                return createdBooking;
            });
            const bookings = await Promise.all(bookingPromises);
            setCreatedBookings(bookings);
            setOrderPlaced(true);
            clearCart();
            setLoading(false);
        } catch (err) {
            console.error('Booking creation error:', err);
            setError('Failed to process your booking. Please try again.');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (orderPlaced) {
        return (
            <div className="checkout-container">
                <div className="order-confirmation">
                    <div className="confirmation-icon">✓</div>
                    <h2>Thank You for Your Booking!</h2>
                    <p>Your order has been successfully placed.</p>
                    <div className="order-info">
                        <p><strong>Order ID:</strong> {orderId}</p>
                        <p><strong>Total Amount:</strong> RM{totalAmount.toFixed(2)}</p>
                        {createdBookings.length > 0 && (
                            <div className="booking-details">
                                <h3>Your Bookings:</h3>
                                {createdBookings.map((booking, index) => (
                                    <div key={index} className="booking-item">
                                        <p><strong>Booking ID:</strong> {booking.booking._id}</p>
                                        <p><strong>Service:</strong> {booking.booking.serviceDetails?.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <p>A confirmation email has been sent to {formData.email}.</p>
                    <p>You can view your booking details in your account dashboard.</p>
                    <div className="confirmation-buttons">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="view-bookings-btn"
                        >
                            View My Bookings
                        </button>
                        <button
                            onClick={() => navigate('/services')}
                            className="continue-shopping-btn"
                        >
                            Browse More Services
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <button onClick={() => navigate(-1)} className="back-button">
                    Back to Cart
                </button>
            </div>

            <div className="checkout-content">
                <div className="checkout-form-container">
                    <h2>Billing Details</h2>

                    {error && <div className="checkout-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name*</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number*</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>

                        <h2>Payment Method</h2>

                        <div className="payment-methods">
                            <div className="payment-option">
                                <label className="payment-label">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="credit-card"
                                        checked={formData.paymentMethod === 'credit-card'}
                                        onChange={handleChange}
                                    />
                                    <span>Credit/Debit Card</span>
                                </label>
                            </div>

                            <div className="payment-option">
                                <label className="payment-label">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank-transfer"
                                        checked={formData.paymentMethod === 'bank-transfer'}
                                        onChange={handleChange}
                                    />
                                    <span>Bank Transfer</span>
                                </label>
                            </div>

                            <div className="payment-option">
                                <label className="payment-label">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={formData.paymentMethod === 'paypal'}
                                        onChange={handleChange}
                                    />
                                    <span>PayPal</span>
                                </label>
                            </div>
                        </div>

                        {formData.paymentMethod === 'credit-card' && (
                            <div className="card-details">
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Card Number*</label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        placeholder="1234 5678 9012 3456"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group half">
                                        <label htmlFor="cardExpiry">Expiry Date*</label>
                                        <input
                                            type="text"
                                            id="cardExpiry"
                                            name="cardExpiry"
                                            value={formData.cardExpiry}
                                            onChange={handleChange}
                                            placeholder="MM/YY"
                                            required
                                        />
                                    </div>

                                    <div className="form-group half">
                                        <label htmlFor="cardCvv">CVV*</label>
                                        <input
                                            type="text"
                                            id="cardCvv"
                                            name="cardCvv"
                                            value={formData.cardCvv}
                                            onChange={handleChange}
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.paymentMethod === 'bank-transfer' && (
                            <div className="bank-details">
                                <p>Please transfer the total amount to:</p>
                                <div className="bank-info">
                                    <p><strong>Bank:</strong> KFK Studio Bank</p>
                                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                                    <p><strong>Account Name:</strong> KFK Studio Photography</p>
                                    <p><strong>Reference:</strong> Your booking will be confirmed after payment is verified</p>
                                </div>
                            </div>
                        )}

                        {formData.paymentMethod === 'paypal' && (
                            <div className="paypal-details">
                                <p>You will be redirected to PayPal to complete your payment after submitting.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-items">
                        {cart.map((item) => (
                            <div key={item.id} className="summary-item">
                                <div className="summary-item-details">
                                    <h3>{item.serviceName}</h3>
                                    <p>Date: {formatDate(item.bookingDate)}</p>
                                    <p>Time: {item.bookingTime}</p>
                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                        <p className="item-options">
                                            Options: {item.selectedOptions.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div className="summary-item-price">
                                    RM{parseFloat(item.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="summary-total">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>RM{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Tax (0%):</span>
                            <span>RM0.00</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total:</span>
                            <span>RM{getCartTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

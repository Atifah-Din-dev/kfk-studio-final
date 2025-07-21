// client/src/components/ShoppingCart.jsx
// ShoppingCart component for displaying the customer's shopping cart with items, total price, and checkout options

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ShoppingCart.css';

const ShoppingCart = () => {
    const navigate = useNavigate();
    const { cart, cartOpen, removeFromCart, getCartTotal, clearCart, toggleCart } = useCart();
    const { isAuthenticated } = useAuth();
    console.log('ShoppingCart render - cartOpen:', cartOpen, 'cart:', cart);

    const handleCheckout = () => {
        if (isAuthenticated) {
            navigate('/checkout');
        } else {
            navigate('/login');
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

    if (!cartOpen) return null;

    return (
        <div className="shopping-cart-overlay">
            <div className="shopping-cart-container">
                <div className="cart-header">
                    <h2>Your Shopping Cart</h2>
                    <button className="close-cart-btn" onClick={toggleCart}>×</button>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <button className="continue-shopping-btn" onClick={toggleCart}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-details">
                                        <h3>{item.serviceName}</h3>
                                        <p>Date: {formatDate(item.bookingDate)}</p>
                                        <p>Time: {item.bookingTime}</p>
                                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                                            <p className="item-options">
                                                Options: {item.selectedOptions.join(', ')}
                                            </p>
                                        )}
                                        <p className="item-price">RM{parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>RM{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="cart-actions">
                                <button className="clear-cart-btn" onClick={clearCart}>
                                    Clear Cart
                                </button>
                                <button className="checkout-btn" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart;
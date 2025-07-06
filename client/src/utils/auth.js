/**
 * Authentication utility functions
 */

// Get auth token from localStorage
export const getToken = () => {
    const Customer = JSON.parse(localStorage.getItem('Customer'));
    return Customer?.token;
};

// Get current Customer from localStorage
export const getCurrentCustomer = () => {
    const Customer = JSON.parse(localStorage.getItem('Customer'));
    return Customer?.Customer;
};

// Check if Customer is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Check if Customer has specific role
export const hasRole = (role) => {
    const Customer = getCurrentCustomer();
    return Customer?.role === role;
};

// Add auth header to requests
export const authHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
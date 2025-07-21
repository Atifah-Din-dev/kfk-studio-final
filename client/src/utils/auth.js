/**
 * Authentication utility functions
 */

// Get auth token from localStorage or sessionStorage (for both customer and manager)
export const getToken = () => {
    // Check Customer data first
    const CustomerFromLocal = localStorage.getItem('Customer');
    const CustomerFromSession = sessionStorage.getItem('Customer');

    const Customer = CustomerFromLocal ? JSON.parse(CustomerFromLocal) :
        CustomerFromSession ? JSON.parse(CustomerFromSession) : null;

    if (Customer?.token) {
        return Customer.token;
    }

    // Check Manager data if no customer token found
    const ManagerFromLocal = localStorage.getItem('Manager');
    const ManagerFromSession = sessionStorage.getItem('Manager');

    const Manager = ManagerFromLocal ? JSON.parse(ManagerFromLocal) :
        ManagerFromSession ? JSON.parse(ManagerFromSession) : null;

    return Manager?.token;
};

// Get current Customer from localStorage or sessionStorage
export const getCurrentCustomer = () => {
    const CustomerFromLocal = localStorage.getItem('Customer');
    const CustomerFromSession = sessionStorage.getItem('Customer');

    const Customer = CustomerFromLocal ? JSON.parse(CustomerFromLocal) :
        CustomerFromSession ? JSON.parse(CustomerFromSession) : null;

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
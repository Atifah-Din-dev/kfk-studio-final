// authService.js
// Service for managing customer authentication and related operations

import apiClient from "./api/apiClient";
import apiStatus from "./api/apiStatus";

const AUTH_ENDPOINT = "/auth";

const checkApiAvailability = async () => {
    try {
        const isReachable = await apiStatus.isServerReachable();
        if (!isReachable) {
            console.warn("API server is not reachable. Proceeding with request anyway.");
        }
        return isReachable;
    } catch (error) {
        console.error("Error checking API availability:", error);
        return false;
    }
};

const login = async (CustomerData, rememberMe = false) => {
    await checkApiAvailability();

    try {
        const res = await apiClient.post(`${AUTH_ENDPOINT}/login`, CustomerData);

        const dataToStore = {
            Customer: res.data.customer,
            token: res.data.token,
        };

        if (rememberMe) {
            localStorage.setItem("Customer", JSON.stringify(dataToStore));
        } else {
            sessionStorage.setItem("Customer", JSON.stringify(dataToStore));
        }

        return dataToStore;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

const register = async (CustomerData) => {
    const res = await apiClient.post(`${AUTH_ENDPOINT}/register`, CustomerData);
    return res.data;
};

const forgotPassword = async (email) => {
    const res = await apiClient.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
    return res.data;
};

const resetPassword = async (token, password) => {
    const res = await apiClient.post(`${AUTH_ENDPOINT}/reset-password`, { token, password });
    return res.data;
};

const logout = () => {
    localStorage.removeItem("Customer");
    sessionStorage.removeItem("Customer");
};

const getCustomerProfile = async () => {
    const res = await apiClient.get(`${AUTH_ENDPOINT}/profile`);
    return res.data;
};

const updateProfile = async (profileData) => {
    const res = await apiClient.put(`${AUTH_ENDPOINT}/profile`, profileData);

    // Update Customer data in storage
    const CustomerData = getCustomer();
    if (CustomerData) {
        const updated = {
            ...CustomerData,
            Customer: {
                ...CustomerData.Customer,
                name: profileData.name || CustomerData.Customer.name,
                email: profileData.email || CustomerData.Customer.email,
                profileImage: profileData.profileImage || CustomerData.Customer.profileImage
            }
        };
        setCustomerData(updated);
    }

    return res.data;
};

const changePassword = async (passwordData) => {
    const res = await apiClient.put(`${AUTH_ENDPOINT}/change-password`, passwordData);
    return res.data;
};

const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await apiClient.post("/auth/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
    });
    return res.data;
};

// Helper functions for managing Customer data
const getCustomer = () => {
    const CustomerFromLocal = localStorage.getItem("Customer");
    const CustomerFromSession = sessionStorage.getItem("Customer");

    if (CustomerFromLocal) {
        return JSON.parse(CustomerFromLocal);
    } else if (CustomerFromSession) {
        return JSON.parse(CustomerFromSession);
    }
    return null;
};

const setCustomerData = (CustomerData) => {
    if (localStorage.getItem("Customer")) {
        localStorage.setItem("Customer", JSON.stringify(CustomerData));
    }
    if (sessionStorage.getItem("Customer")) {
        sessionStorage.setItem("Customer", JSON.stringify(CustomerData));
    }
};

const checkSessionValidity = () => {
    const CustomerData = getCustomer();
    if (!CustomerData) return false;

    const token = CustomerData.token;
    if (!token) return false;

    // Check if token is expired by decoding it
    // This is a simple check and might not be 100% accurate
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
            logout();
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
};

const authService = {
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    getCustomerProfile,
    updateProfile,
    changePassword,
    getCustomer,
    checkSessionValidity,
    uploadProfileImage
};

export default authService;

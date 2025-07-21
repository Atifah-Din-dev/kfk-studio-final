// managerAuthService.js
// Service for managing manager authentication and related operations

import apiClient from "./api/apiClient";

const MANAGER_ENDPOINT = "/manager";

const login = async (managerData, rememberMe = false) => {
    try {
        const res = await apiClient.post(`${MANAGER_ENDPOINT}/login`, managerData);

        const dataToStore = {
            Manager: res.data.manager,
            token: res.data.token,
            userType: "manager"
        };

        if (rememberMe) {
            localStorage.setItem("Manager", JSON.stringify(dataToStore));
        } else {
            sessionStorage.setItem("Manager", JSON.stringify(dataToStore));
        }

        return dataToStore;
    } catch (error) {
        console.error("Manager login error:", error);
        throw error;
    }
};

const register = async (managerData) => {
    const res = await apiClient.post(`${MANAGER_ENDPOINT}/register`, managerData);
    return res.data;
};

const logout = () => {
    localStorage.removeItem("Manager");
    sessionStorage.removeItem("Manager");
};

const getManagerProfile = async () => {
    const res = await apiClient.get(`${MANAGER_ENDPOINT}/profile`);
    return res.data;
};

const updateProfile = async (profileData) => {
    const res = await apiClient.put(`${MANAGER_ENDPOINT}/profile`, profileData);

    const managerData = getManager();
    if (managerData) {
        const updated = {
            ...managerData,
            Manager: {
                ...managerData.Manager,
                name: profileData.name || managerData.Manager.name,
                email: profileData.email || managerData.Manager.email
            }
        };
        setManagerData(updated);
    }

    return res.data;
};

const changePassword = async (passwordData) => {
    const res = await apiClient.put(`${MANAGER_ENDPOINT}/change-password`, passwordData);
    return res.data;
};

const getDashboardStats = async () => {
    const res = await apiClient.get(`${MANAGER_ENDPOINT}/dashboard-stats`);
    return res.data;
};

const getAllBookings = async () => {
    const res = await apiClient.get(`${MANAGER_ENDPOINT}/bookings`);
    return res.data;
};

const getAllCustomers = async () => {
    const res = await apiClient.get(`${MANAGER_ENDPOINT}/customers`);
    return res.data;
};

// Helper functions for managing manager data
const getManager = () => {
    const managerFromLocal = localStorage.getItem("Manager");
    const managerFromSession = sessionStorage.getItem("Manager");

    return managerFromLocal ? JSON.parse(managerFromLocal) :
        managerFromSession ? JSON.parse(managerFromSession) : null;
};

const setManagerData = (managerData) => {
    if (localStorage.getItem("Manager")) {
        localStorage.setItem("Manager", JSON.stringify(managerData));
    }
    if (sessionStorage.getItem("Manager")) {
        sessionStorage.setItem("Manager", JSON.stringify(managerData));
    }
};

const checkSessionValidity = () => {
    const managerData = getManager();
    if (!managerData) return false;

    const token = managerData.token;
    if (!token) return false;

    // Check if token is expired by decoding it
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

const managerAuthService = {
    login,
    register,
    logout,
    getManagerProfile,
    updateProfile,
    changePassword,
    getManager,
    checkSessionValidity,
    getDashboardStats,
    getAllBookings,
    getAllCustomers
};

export default managerAuthService;

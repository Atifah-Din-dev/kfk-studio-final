// AuthContext.js
// Context for managing authentication state and user sessions/logout

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import authService from '../services/authService';
import managerAuthService from '../services/managerAuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [Customer, setCustomer] = useState(null);
    const [Manager, setManager] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState(null);
    const [inactivityTimer, setInactivityTimer] = useState(null);

    // Load Customer data when component mounts
    useEffect(() => {
        const loadCustomerOrManager = async () => {
            try {
                // Check if Customer session is valid
                if (authService.checkSessionValidity()) {
                    const CustomerData = authService.getCustomer();
                    setCustomer(CustomerData);
                    try {
                        const profileData = await authService.getCustomerProfile();
                        updateCustomerData(profileData);
                    } catch (error) {
                        console.log("Could not fetch updated profile");
                    }
                    setupSessionMonitoring(CustomerData);
                } else if (managerAuthService.checkSessionValidity()) {
                    const ManagerData = managerAuthService.getManager();
                    setManager(ManagerData);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCustomerOrManager();

        // Cleanup on unmount
        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            if (sessionTimeout) clearTimeout(sessionTimeout);
        };
    }, []);

    // Set up listeners for Customer activity to track session timeout
    useEffect(() => {
        if (!isAuthenticated()) return;

        // Reset inactivity timer on Customer interaction
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
        const resetInactivityTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            startInactivityTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, resetInactivityTimer);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [inactivityTimer, Customer]);

    // Helper function to update Customer data
    const updateCustomerData = useCallback((profileData) => {
        if (!profileData) return;
        // Always wrap profileData under Customer key for consistency
        setCustomer((prev) => ({
            ...(prev || {}),
            Customer: {
                ...(prev?.Customer || {}),
                ...profileData
            }
        }));
    }, []);

    // Start timer to track Customer inactivity
    const startInactivityTimer = useCallback(() => {
        // Default to 30 minutes if not set in Customer preferences
        const timeoutDuration = (Customer?.Customer?.preferences?.sessionTimeout || 30) * 60 * 1000;

        const timer = setTimeout(() => {
            console.log("Session expired due to inactivity");
            logout();
        }, timeoutDuration);

        setInactivityTimer(timer);
    }, [Customer]);

    // Setup session monitoring based on token expiry
    const setupSessionMonitoring = useCallback((CustomerData) => {
        if (!CustomerData?.token) return;

        try {
            // Decode token to get expiration time
            const base64Url = CustomerData.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Calculate time until token expiry (with 5 minute buffer)
            const expiresAt = payload.exp * 1000;
            const timeUntilExpiry = expiresAt - Date.now() - (5 * 60 * 1000);

            if (timeUntilExpiry > 0) {
                // Set timeout to log out Customer when token expires
                const timer = setTimeout(() => {
                    console.log("Session token expired");
                    logout();
                }, timeUntilExpiry);

                setSessionTimeout(timer);
            } else {
                // Token already expired
                logout();
            }

            // Also start inactivity timer
            startInactivityTimer();
        } catch (error) {
            console.error("Error setting up session monitoring:", error);
        }
    }, [startInactivityTimer]);

    const login = async (credentials, rememberMe = false) => {
        setLoading(true);
        try {
            const CustomerData = await authService.login(credentials, rememberMe);
            // Always wrap under Customer key
            setCustomer({ Customer: CustomerData.customer, token: CustomerData.token });
            setupSessionMonitoring({ Customer: CustomerData.customer, token: CustomerData.token });
            setLoading(false);
            return { Customer: CustomerData.customer, token: CustomerData.token };
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const register = async (CustomerData) => {
        setLoading(true);
        try {
            const result = await authService.register(CustomerData);
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setCustomer(null);

        // Clear all session timers
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (sessionTimeout) clearTimeout(sessionTimeout);
        setInactivityTimer(null);
        setSessionTimeout(null);
    };

    const forgotPassword = async (email) => {
        return await authService.forgotPassword(email);
    };

    const resetPassword = async (token, password) => {
        return await authService.resetPassword(token, password);
    };

    const updateProfile = async (profileData) => {
        try {
            const updatedProfile = await authService.updateProfile(profileData);
            updateCustomerData(updatedProfile);
            return updatedProfile;
        } catch (error) {
            throw error;
        }
    };

    const changePassword = async (passwordData) => {
        return await authService.changePassword(passwordData);
    };

    const isAuthenticated = useCallback(() => {
        // Check for either Customer or Manager session validity
        if (Customer && authService.checkSessionValidity()) return true;
        if (Manager && managerAuthService.checkSessionValidity()) return true;
        return false;
    }, [Customer, Manager]);

    const hasRole = useCallback((role) => {
        // Check role for Customer or Manager
        if (Customer?.Customer?.role === role) return true;
        if (Manager?.Manager?.role === role || role === 'manager') return true;
        return false;
    }, [Customer, Manager]);

    return (
        <AuthContext.Provider
            value={{
                Customer,
                Manager,
                loading,
                login,
                register,
                logout,
                forgotPassword,
                resetPassword,
                updateProfile,
                changePassword,
                isAuthenticated,
                hasRole
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
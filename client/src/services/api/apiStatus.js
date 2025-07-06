import apiClient from './apiClient';

/**
 * API status service to check connectivity to the backend server
 */
const apiStatus = {
    /**
     * Checks if the API server is reachable
     * @returns {Promise<boolean>} True if API is reachable, false otherwise
     */
    isServerReachable: async () => {
        try {
            // Try to reach the server root instead of the API root endpoint
            // By using axios directly instead of apiClient, we can bypass the baseURL
            const axios = require('axios');
            // await axios.get('http://localhost:5000/api'); // My computer's localhost
            await axios.get('http://192.168.3.143:5000/api'); // UTM IP address
            // await axios.get('http://192.168.50.212:5000/api'); // Rumah Nad IP address

            return true;
        } catch (error) {
            console.error('API server connectivity check failed:', error.message);
            return false;
        }
    },

    /**
     * Checks if specific API endpoints are accessible
     * @returns {Promise<Object>} Object with status of each major endpoint
     */
    checkEndpoints: async () => {
        const results = {
            auth: false,
            bookings: false
        };

        try {
            // Check auth endpoint (using a HEAD request to avoid side effects)
            await apiClient.head('/auth');
            results.auth = true;
        } catch (error) {
            console.warn('Auth endpoint check failed:', error.message);
        }

        try {
            // Check bookings endpoint (using a HEAD request to avoid side effects)
            await apiClient.head('/bookings');
            results.bookings = true;
        } catch (error) {
            console.warn('Bookings endpoint check failed:', error.message);
        }

        return results;
    }
};

export default apiStatus;
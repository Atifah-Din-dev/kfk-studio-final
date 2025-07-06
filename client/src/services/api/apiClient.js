import axios from 'axios';
import { getToken } from '../../utils/auth';

// Create axios instance with base URL
const apiClient = axios.create({

    // baseURL: 'http://localhost:5000/api', // My computer's localhost
    baseURL: 'http://192.168.3.143:5000/api', // UTM IP address
    // baseURL: 'http://192.168.50.212:5000/api', // Rumah Nad IP address
    headers: {
        'Content-Type': 'application/json',
    },
    // Add timeout to prevent requests hanging indefinitely
    timeout: 10000
});

/**
 * Utility function to retry failed requests
 * @param {Function} axiosCall - The axios call function to retry
 * @param {Number} retries - Number of retries
 * @param {Number} retryDelay - Delay between retries in ms
 * @returns {Promise} - The axios promise
 */
const retryRequest = async (axiosCall, retries = 2, retryDelay = 1000) => {
    try {
        return await axiosCall();
    } catch (error) {
        if (retries <= 0 || !isRetryable(error)) {
            throw error;
        }

        console.log(`Request failed, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return retryRequest(axiosCall, retries - 1, retryDelay * 1.5);
    }
};

/**
 * Check if an error should trigger a retry
 * @param {Error} error - The axios error
 * @returns {Boolean} - Whether to retry or not
 */
const isRetryable = (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        console.log('Token used for API:', token); // Add this line
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log outgoing requests to help with debugging
        console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, {
            headers: config.headers,
            data: config.data
        });

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
            data: response.data
        });
        return response;
    },
    (error) => {
        // Log error responses
        console.error('API Error Response:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        const originalRequest = error.config;

        // Handle unauthorized errors (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If token expired or invalid, logout the Customer
            localStorage.removeItem('Customer');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle forbidden errors (403)
        if (error.response?.status === 403) {
            console.error('Permission denied');
        }

        // Handle server errors (500)
        if (error.response?.status === 500) {
            console.error('Server error details:', error.response.data);
        }

        // Handle network errors (like CORS or server not reachable)
        if (error.message === 'Network Error') {
            console.error('Network Error: Please check if the server is running and CORS is configured correctly');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
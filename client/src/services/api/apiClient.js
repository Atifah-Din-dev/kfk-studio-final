// client/src/services/api/apiClient.js
// API client for making HTTP requests to the backend server

import axios from 'axios';
import { getToken } from '../../utils/auth';

const apiClient = axios.create({

    // baseURL: 'http://localhost:5000/api', // My computer's localhost  
    baseURL: 'http://10.215.107.23:5000/api', // UTM IP address
    // baseURL: 'http://192.168.50.212:5000/api', // Rumah Nad IP address
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000
});
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

const isRetryable = (error) => {
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        console.log('Token used for API:', token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
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

apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error Response:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('Customer');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            console.error('Permission denied');
        }

        if (error.response?.status === 500) {
            console.error('Server error details:', error.response.data);
        }

        if (error.message === 'Network Error') {
            console.error('Network Error: Please check if the server is running and CORS is configured correctly');
        }

        return Promise.reject(error);
    }
);

export default apiClient;

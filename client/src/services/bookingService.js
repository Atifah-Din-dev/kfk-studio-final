// client/src/services/bookingService.js
// Service for managing booking operations, including fetching services, creating bookings, and managing customer bookings

import apiClient from './api/apiClient';

const bookingService = {
    getServices: async () => {
        try {
            const response = await apiClient.get('/services');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    getCustomerBookings: async () => {
        try {
            const response = await apiClient.get('/bookings/Customer');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    getBookingById: async (bookingId) => {
        try {
            const response = await apiClient.get(`/api/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    cancelBooking: async (bookingId) => {
        try {
            const response = await apiClient.put(`/api/bookings/${bookingId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    updateBooking: async (bookingId, updateData) => {
        try {
            const response = await apiClient.put(`/api/bookings/${bookingId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    getAvailableTimeSlots: async (serviceId, date) => {
        try {
            const response = await apiClient.get('/bookings/available-slots', {
                params: { serviceId, date }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    submitFeedback: async (bookingId, feedbackData) => {
        try {
            const response = await apiClient.post(`/api/bookings/${bookingId}/feedback`, feedbackData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    checkBookingEligibility: async (serviceId) => {
        try {
            const response = await apiClient.get('/api/bookings/eligibility', {
                params: { serviceId }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    }
};

export default bookingService;

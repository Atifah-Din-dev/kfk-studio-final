import apiClient from './api/apiClient';

const bookingService = {
    // Get available services
    getServices: async () => {
        try {
            const response = await apiClient.get('/api/services');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Create a new booking
    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/api/bookings', bookingData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Get Customer's bookings
    getCustomerBookings: async () => {
        try {
            const response = await apiClient.get('/api/bookings/Customer');
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Get booking by ID
    getBookingById: async (bookingId) => {
        try {
            const response = await apiClient.get(`/api/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Cancel booking
    cancelBooking: async (bookingId) => {
        try {
            const response = await apiClient.put(`/api/bookings/${bookingId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Update booking
    updateBooking: async (bookingId, updateData) => {
        try {
            const response = await apiClient.put(`/api/bookings/${bookingId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Get available time slots for a specific date and service
    getAvailableTimeSlots: async (serviceId, date) => {
        try {
            const response = await apiClient.get('/api/bookings/available-slots', {
                params: { serviceId, date }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Submit feedback for a booking
    submitFeedback: async (bookingId, feedbackData) => {
        try {
            const response = await apiClient.post(`/api/bookings/${bookingId}/feedback`, feedbackData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    // Check if a Customer can book (limits, restrictions, etc.)
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
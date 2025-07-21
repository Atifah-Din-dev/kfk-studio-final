import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bookingService from "../../services/bookingService";
import "../../styles/BookingConfirmationPage.css";

const BookingConfirmationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login", { state: { from: `/booking/confirmation/${id}` } });
        }
    }, [isAuthenticated, navigate, id]);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getBookingById(id);
                setBookingData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching booking details:", err);
                setError("Failed to load booking details. Please try again later.");
                setLoading(false);
            }
        };

        if (isAuthenticated() && id) {
            fetchBookingDetails();
        }
    }, [id, isAuthenticated]);
    // ...rest of the code...
};

export default BookingConfirmationPage;

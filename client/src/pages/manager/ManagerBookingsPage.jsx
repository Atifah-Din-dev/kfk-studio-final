import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import managerAuthService from "../../services/managerAuthService";
import "../../styles/ManagerBookingsPage.css";

const statusLabels = [
    "Confirmed",
    "On-going Session",
    "Sorting",
    "Editing",
    "Editing Quality Checking (EQC)",
    "Printing Quality Checking (PQC)",
    "Packaging",
    "Posting",
    "Delivered"
];

const ManagerBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Manager authentication check
        if (!managerAuthService.checkSessionValidity()) {
            navigate("/manager-login");
            return;
        }
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await managerAuthService.getAllBookings();
                setBookings(data);
            } catch (err) {
                setError("Failed to load bookings.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    // ...rest of the code...
};

export default ManagerBookingsPage;

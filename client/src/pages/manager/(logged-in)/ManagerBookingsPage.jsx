// client/src/pages/manager/(logged-in)/ManagerBookingsPage.jsx
// ManagerBookingsPage for displaying all customer bookings with options to edit their status

import { useEffect, useState } from "react";
import apiClient from "../../../services/api/apiClient";
import { useNavigate } from "react-router-dom";
import managerAuthService from "../../../services/managerAuthService";
import "../../../styles/ManagerBookingsPage.css";

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
    const [editingStatus, setEditingStatus] = useState({});
    const [savingStatus, setSavingStatus] = useState({});
    const navigate = useNavigate();

    const handleStatusChange = (bookingId, value) => {
        setEditingStatus(prev => ({ ...prev, [bookingId]: value }));
    };

    const handleSaveStatus = async (bookingId) => {
        setSavingStatus(prev => ({ ...prev, [bookingId]: true }));
        try {
            const newStatus = editingStatus[bookingId];
            await apiClient.put(`/bookings/${bookingId}/status`, { status: newStatus });
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
            setEditingStatus(prev => ({ ...prev, [bookingId]: undefined }));
        } catch (err) {
            setError("Failed to update booking status.");
        } finally {
            setSavingStatus(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    useEffect(() => {
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

    return (
        <div className="manager-bookings-container">
            <h1 className="manager-bookings-title">All Customer Bookings</h1>
            {loading ? (
                <div className="loading">Loading bookings...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <table className="manager-bookings-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Booking Date</th>
                            <th>Customer ID</th>
                            <th>Customer Name</th>
                            <th>Product/Service Booked</th>
                            <th>Session Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking._id}</td>
                                <td>{new Date(booking.createdAt).toLocaleString()}</td>
                                <td>{booking.Customer?._id || booking.Customer}</td>
                                <td>{booking.Customer?.name || "-"}</td>
                                <td>{booking.serviceDetails?.name || booking.serviceDetails?.serviceName || booking.service}</td>
                                <td>{booking.date ? new Date(booking.date).toLocaleDateString() : "-"}</td>
                                <td>
                                    <select
                                        value={editingStatus[booking._id] !== undefined ? editingStatus[booking._id] : booking.status}
                                        onChange={e => handleStatusChange(booking._id, e.target.value)}
                                        disabled={savingStatus[booking._id]}
                                    >
                                        {statusLabels.map(label => (
                                            <option key={label} value={label}>{label}</option>
                                        ))}
                                    </select>
                                    {editingStatus[booking._id] !== undefined && editingStatus[booking._id] !== booking.status && (
                                        <button
                                            style={{ marginLeft: 8 }}
                                            onClick={() => handleSaveStatus(booking._id)}
                                            disabled={savingStatus[booking._id]}
                                        >
                                            {savingStatus[booking._id] ? "Saving..." : "Save"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManagerBookingsPage;

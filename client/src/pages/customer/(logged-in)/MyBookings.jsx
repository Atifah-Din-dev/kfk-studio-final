import { AccountSidebar } from "./MyDashboard.jsx";
import BookingLists from "../../../components/BookingLists";
import "../../../styles/MyBookings.css";

const MyBookings = () => (
    <div className="profile-container">
        <div className="profile-layout">
            <AccountSidebar />
            <div className="profile-main">
                <section className="profile-section">
                    <h2>My Bookings</h2>
                    <BookingLists />
                </section>
            </div>
        </div>
    </div>
);

export default MyBookings;

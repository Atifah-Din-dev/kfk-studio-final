// client/src/pages/customer/ProfilePage.jsx
// Profile page for the customer, allowing them to view and edit their profile information

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import "../../styles/ProfilePage.css";

const ProfilePage = () => {
    const { Customer, updateProfile, changePassword } = useAuth();
    // ...rest of the code...
};

export default ProfilePage;

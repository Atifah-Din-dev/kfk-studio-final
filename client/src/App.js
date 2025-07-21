import ManagerServicesPage from "./pages/manager/(logged-in)/ManagerServicesPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navigation from "./components/Navigation";
import ShoppingCart from "./components/ShoppingCart";
import LoginPage from "./pages/customer/LoginPage";
import RegisterPage from "./pages/customer/RegisterPage";
import ForgotPasswordPage from "./pages/customer/ForgotPasswordPage";
import ResetPasswordPage from "./pages/customer/ResetPasswordPage";
import ServicesPage from "./pages/customer/ServicesPage";
import ServiceDetailsPage from "./pages/customer/ServiceDetailsPage";
import BookingPage from "./pages/customer/(logged-in)/BookingPage";
import BookingConfirmationPage from "./pages/customer/(logged-in)/BookingConfirmationPage";
import CheckoutPage from "./pages/customer/(logged-in)/CheckoutPage";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import LandingPage from "./pages/customer/LandingPage";

// Customer dashboard and profile pages
import MyDashboard from "./pages/customer/(logged-in)/MyDashboard";
import MyProfile from "./pages/customer/(logged-in)/MyProfile";
import MyBookings from "./pages/customer/(logged-in)/MyBookings";
import ChangePasswordPage from "./pages/customer/(logged-in)/ChangePasswordPage";
import SessionPreferencesPage from "./pages/customer/(logged-in)/SessionPreferencesPage";

// Manager pages
import ManagerLoginPage from "./pages/manager/ManagerLoginPage";
import ManagerDashboard from "./pages/manager/(logged-in)/ManagerDashboard";
import ManagerBookingsPage from "./pages/manager/(logged-in)/ManagerBookingsPage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Navigation />
            <ShoppingCart />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Manager Routes */}
                <Route path="/manager-login" element={<ManagerLoginPage />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/manager/services" element={<RoleBasedRoute allowedRoles="manager"><ManagerServicesPage /></RoleBasedRoute>} />

                {/* Private Routes (require authentication) */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <MyDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <MyProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/account/bookings"
                  element={
                    <PrivateRoute>
                      <MyBookings />
                    </PrivateRoute>
                  }
                />
                {/* Add direct /bookings route for easier access */}
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <MyBookings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/account/change-password"
                  element={
                    <PrivateRoute>
                      <ChangePasswordPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/account/session-preferences"
                  element={
                    <PrivateRoute>
                      <SessionPreferencesPage />
                    </PrivateRoute>
                  }
                />

                {/* Services Page - Publicly Accessible */}
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailsPage />} />

                {/* Booking Related Routes */}
                <Route
                  path="/booking"
                  element={
                    <PrivateRoute>
                      <BookingPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/booking/confirmation/:id"
                  element={
                    <PrivateRoute>
                      <BookingConfirmationPage />
                    </PrivateRoute>
                  }
                />

                {/* Checkout Route */}
                <Route
                  path="/checkout"
                  element={
                    <PrivateRoute>
                      <CheckoutPage />
                    </PrivateRoute>
                  }
                />

                {/* Role-based Routes (require specific roles) */}
                <Route
                  path="/manager/*"
                  element={
                    <RoleBasedRoute allowedRoles="manager">
                      {/* Insert Manager components here */}
                      <div className="manager-dashboard-header">Manager Dashboard (Protected by Role)</div>
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/manager/bookings"
                  element={
                    <RoleBasedRoute allowedRoles="manager">
                      <ManagerBookingsPage />
                    </RoleBasedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

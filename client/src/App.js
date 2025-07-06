import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import BookingPage from "./pages/(logged-in)/BookingPage";
import BookingConfirmationPage from "./pages/(logged-in)/BookingConfirmationPage";
import CheckoutPage from "./pages/CheckoutPage";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import LandingPage from "./pages/LandingPage";

// Customer dashboard and profile pages
import MyDashboard from "./pages/(logged-in)/MyDashboard";
import MyProfile from "./pages/(logged-in)/MyProfile";
import MyBookings from "./pages/(logged-in)/MyBookings";
import ChangePasswordPage from "./pages/(logged-in)/ChangePasswordPage";
import SessionPreferencesPage from "./pages/(logged-in)/SessionPreferencesPage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                      <div>Manager Dashboard (Protected by Role)</div>
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

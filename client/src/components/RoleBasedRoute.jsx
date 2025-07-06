import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

/**
 * Component to restrict access based on Customer role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Single role or array of roles allowed to access
 * @param {string} [props.redirectPath="/dashboard"] - Path to redirect unauthorized Customers
 * @returns {React.ReactNode} - Rendered component or redirect
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectPath = "/dashboard" }) => {
    const { Customer, hasRole, isAuthenticated, loading } = useAuth();

    // Check if still loading authentication state
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    // First check if Customer is authenticated at all
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    // Convert single role to array for consistent checking
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if Customer has at least one of the allowed roles
    const hasAllowedRole = roles.some(role => hasRole(role));

    // If Customer doesn't have an allowed role, redirect
    if (!hasAllowedRole) {
        return <Navigate to={redirectPath} />;
    }

    // Customer is authenticated and has allowed role, render the protected component
    return children;
};

RoleBasedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    redirectPath: PropTypes.string
};

export default RoleBasedRoute;
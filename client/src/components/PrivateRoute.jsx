import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading spinner or placeholder while checking auth status
    if (loading) {
        return <div>Loading...</div>;
    }

    // If not logged in, redirect to login page
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    // If logged in, render the protected component
    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default PrivateRoute;

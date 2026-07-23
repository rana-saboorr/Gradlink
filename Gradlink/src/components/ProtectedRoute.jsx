import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute — Guards any route that requires admin authentication.
 * Reads auth state from Redux store (which is itself backed by sessionStorage).
 * If not authenticated, redirects to /admin with the original path in state.
 */
const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useSelector((state) => state.adminAuth);
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

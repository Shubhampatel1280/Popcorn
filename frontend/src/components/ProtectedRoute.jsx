import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation(); // Gets the current URL the user is trying to visit

  if (!user) {
    // If no user, redirect to login, but save the intended destination in 'state'
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If logged in, allow them to see the page
  return children;
}

export default ProtectedRoute;
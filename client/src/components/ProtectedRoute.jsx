import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { authData } = useSelector((state) => state.auth);

  if (!authData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
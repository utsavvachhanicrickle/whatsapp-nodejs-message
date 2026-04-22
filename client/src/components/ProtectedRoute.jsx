import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { authData } = useSelector((state) => state.auth);

  return !authData ? <Navigate to="/login" replace /> : <Outlet />;
};

export default ProtectedRoute;

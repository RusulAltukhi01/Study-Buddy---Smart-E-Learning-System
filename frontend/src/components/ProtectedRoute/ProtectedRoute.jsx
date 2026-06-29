import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../UI/Loader/Loader";
import { toast } from "sonner";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to access this page");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[var(--primary-background)]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase() || "unknown";
    const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!isAllowed) {
      toast.error("Access denied. You don't have permission to access this page.");

      if (userRole === "student") return <Navigate to="/student/dashboard" replace />;
      if (userRole === "instructor") return <Navigate to="/instructor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.userType !== "Student") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default StudentRoute;
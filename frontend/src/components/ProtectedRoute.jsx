import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();  //  Add loading from context

  if (loading) {  //  Check loading instead of user === undefined
    return <p className="text-center mt-10">Checking authentication...</p>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
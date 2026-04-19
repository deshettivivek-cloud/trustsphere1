// src/components/ProtectedRoute.jsx — Fixed: waits for auth loading before redirecting

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth state to resolve before making a redirect decision
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-paper flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gov-navy-900/10 border-2 border-gov-navy-900/30 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-gov-navy-900" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-gov-saffron/50 animate-ping"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-gov-inksoft">Verifying session integrity…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

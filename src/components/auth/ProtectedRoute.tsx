import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'superadmin' | 'subscriber' | 'writer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && profile?.role !== requireRole) {
    if (profile?.role === 'superadmin') {
      return <Navigate to="/admin" replace />;
    } else if (profile?.role === 'writer') {
      return <Navigate to="/writer" replace />;
    } else {
      return <Navigate to="/subscriber" replace />;
    }
  }

  return <>{children}</>;
};

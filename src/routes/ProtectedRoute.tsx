import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage text="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage text="Loading..." />;
  if (user) {
    return <Navigate to={user.profile.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <Outlet />;
}

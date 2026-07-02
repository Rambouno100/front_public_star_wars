import { Navigate } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';

export const AdminRoute = ({ children }) => {
  const { data: user, isLoading } = useMe();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_staff) return <Navigate to="/" replace />;
  return children;
};

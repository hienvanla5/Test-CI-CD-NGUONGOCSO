import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RoleRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.roleCode)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;

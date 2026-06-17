import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/api';

/** Where to send an unauthenticated visitor for each protected role. */
const LOGIN_ROUTE: Record<UserRole, string> = {
  parent: '/register',
  vendor: '/vendor/login',
  school_admin: '/school/login',
  platform_admin: '/admin/login',
};

interface RequireAuthProps {
  roles: UserRole[];
  children: ReactNode;
}

export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const target = LOGIN_ROUTE[roles[0]] ?? '/';
    return <Navigate to={target} replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    // Authenticated but wrong portal — send home rather than leak the page.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

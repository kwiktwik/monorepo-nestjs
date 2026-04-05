import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * PrivateRoute component that protects admin routes from unauthorized access.
 * Redirects to login if user is not authenticated.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuth();

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists, render the protected content
  return <>{children}</>;
}

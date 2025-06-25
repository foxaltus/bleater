import type { ReactNode } from 'react';
import { useAuth } from '../lib/useAuth';
import AuthForm from './AuthForm';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}

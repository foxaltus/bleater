import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../lib/useAuth";

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signInWithGitHub } = useAuth();

  // Automatically trigger GitHub sign-in if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      signInWithGitHub();
    }
  }, [loading, user, signInWithGitHub]);

  // Show loading screen with logo while waiting for authentication
  if (loading || !user) {
    return (
      <div className="loading-container">
        <img src="/logo.png" alt="Bleater Logo" className="loading-logo" />
      </div>
    );
  }

  return <>{children}</>;
}

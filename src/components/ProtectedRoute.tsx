import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../lib/useAuth";

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signInWithGitHub, autoLogin } = useAuth();

  // Automatically trigger GitHub sign-in if auto-login is enabled
  useEffect(() => {
    if (!loading && !user && autoLogin()) {
      signInWithGitHub();
    }
  }, [loading, user, signInWithGitHub, autoLogin]);

  // Show loading screen - sign-out UI is handled in AppContent
  if (loading || !user) {
    return (
      <div className="loading-container">
        <img
          src={import.meta.env.BASE_URL + "logo.png"}
          alt="Bleater Logo"
          className="loading-logo"
        />
      </div>
    );
  }

  return <>{children}</>;
}

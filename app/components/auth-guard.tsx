import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "~/store/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // If user is authenticated and trying to access public route, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

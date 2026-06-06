import { Navigate, useLocation } from "react-router";
import { canAccessRole } from "~/lib/access-control";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: readonly UserRole[];
}

export function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
}: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // If user is authenticated and trying to access public route, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  if (requireAuth && !canAccessRole(user?.role, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

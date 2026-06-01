import { Outlet } from "react-router";
import { AuthGuard } from "./auth-guard";

// TODO: AppLayout component needs to be created
// This component is currently not used by any route
export default function AuthLayout() {
  return (
    <AuthGuard requireAuth={true}>
      <Outlet />
    </AuthGuard>
  );
}

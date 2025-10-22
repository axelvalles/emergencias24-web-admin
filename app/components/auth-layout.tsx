import { Outlet } from "react-router";
import { AuthGuard } from "./auth-guard";
import { AppLayout } from "./layout";

export default function AuthLayout() {
  return (
    <AuthGuard requireAuth={true}>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  );
}
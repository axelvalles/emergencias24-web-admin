import { Outlet, useLocation } from "react-router";
import { AuthGuard } from "../../components/auth-guard";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/layout/app-sidebar";
import Header from "~/components/layout/header";
import { useTicketEvents } from "~/hooks/use-ticket-events";
import { getAllowedRolesForPath } from "~/lib/access-control";

export default function AuthLayout() {
  useTicketEvents();
  const location = useLocation();

  const allowedRoles = getAllowedRolesForPath(location.pathname);

  return (
    <AuthGuard requireAuth={true} allowedRoles={allowedRoles}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
          <Outlet />
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}

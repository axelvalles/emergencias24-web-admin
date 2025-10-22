import { Outlet } from "react-router";
import { AuthGuard } from "../../components/auth-guard";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/layout/app-sidebar";
import Header from "~/components/layout/header";
import { useTicketEvents } from "~/hooks/use-ticket-events";

export default function AuthLayout() {
  useTicketEvents();

  return (
    <AuthGuard requireAuth={true}>
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

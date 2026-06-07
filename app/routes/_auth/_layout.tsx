import { Outlet, useLocation } from "react-router";
import { AuthGuard } from "../../components/auth-guard";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/layout/app-sidebar";
import Header from "~/components/layout/header";
import { useTicketEvents } from "~/hooks/use-ticket-events";
import { UserRole } from "~/types/users";

const ROUTE_ROLE_RULES: Array<{
  prefix: string;
  allowedRoles: readonly UserRole[];
}> = [
  {
    prefix: "/usuarios",
    allowedRoles: [UserRole.ADMIN],
  },
  {
    prefix: "/unidades-ambulancia",
    allowedRoles: [UserRole.ADMIN],
  },
  {
    prefix: "/costos-municipio",
    allowedRoles: [UserRole.SUPER_ADMIN],
  },
  {
    prefix: "/tickets",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AMBULANCE],
  },
  {
    prefix: "/pacientes",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  {
    prefix: "/planes",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  {
    prefix: "/beneficios",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  {
    prefix: "/suscripciones",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  {
    prefix: "/empresas",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
];

export default function AuthLayout() {
  useTicketEvents();
  const location = useLocation();

  const matchedRule = ROUTE_ROLE_RULES.find((rule) =>
    location.pathname.startsWith(rule.prefix)
  );

  return (
    <AuthGuard requireAuth={true} allowedRoles={matchedRule?.allowedRoles}>
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

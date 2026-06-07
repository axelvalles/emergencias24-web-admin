import { Separator } from "~/components/ui/separator";
import PageContainer from "~/components/layout/page-container";
import { Heading } from "~/components/ui/heading";
import TicketListingPage from "~/features/tickets/ticket-listing";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";

export default function Tickets() {
  const user = useAuthStore((state) => state.user);
  const needsActiveUnitSelection =
    user?.role === UserRole.AMBULANCE &&
    (user.ambulanceUnits.length > 1 || user.ambulanceUnits.length === 0) &&
    !user.activeAmbulanceUnit;
  const title = user?.role === UserRole.AMBULANCE ? "Mis tickets" : "Tickets";
  const description =
    user?.role === UserRole.AMBULANCE
      ? "Consulta los tickets asignados a tu unidad activa."
      : "Gestiona los tickets de emergencia.";

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={title} description={description} />
        </div>
        {needsActiveUnitSelection && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Selecciona una unidad activa en el encabezado para consultar y operar tickets.
          </div>
        )}
        <Separator />
        <TicketListingPage />
      </div>
    </PageContainer>
  );
}

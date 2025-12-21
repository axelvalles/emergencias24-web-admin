import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import {
  TicketStatus,
  TicketTypeLabels,
  TicketStatusLabels,
  TicketPriorityLabels,
  TicketPriority,
} from "~/types/tickets";
import { LocationDisplay } from "~/components/map/location-display";
import PatientInfoCard from "~/features/tickets/patient-info-card";
import ButtonAssign from "~/features/tickets/button-assign";
import ButtonStart from "~/features/tickets/button-start";
import ButtonCancel from "~/features/tickets/button-cancel";
import ButtonComplete from "~/features/tickets/button-complete";
import TicketHistoryTimeline from "~/features/tickets/ticket-history-timeline";
import { isValidCoordinates } from "~/lib/validate-coordinates";
import { format } from "date-fns";

export default function TicketViewPage() {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket-by-reference", referenceNumber],
    queryFn: () => ticketApi.getTicketByReference(Number(referenceNumber)),
  });
  console.log(ticket);

  if (error) {
    toast.error("Error al cargar el ticket");
  }

  if (isLoading) {
    return <div>Cargando ticket...</div>;
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  return (
    <PageContainer scrollable={false}>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap space-x-4">
            <Button variant="outline" onClick={() => navigate("/tickets")}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                Ticket #{ticket.referenceNumber}
              </h1>
              <p className="text-muted-foreground">
                Creado el {format(ticket.createdAt, "dd/MM/yyyy hh:mm a")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(ticket.status === TicketStatus.PENDING ||
              ticket.status === TicketStatus.ASSIGNED) && (
              <ButtonAssign
                ticketId={ticket.id}
                text={ticket.assignedAt && "Reasignar"}
              />
            )}

            {ticket.status === TicketStatus.ASSIGNED && (
              <ButtonStart ticketId={ticket.id} />
            )}

            {ticket.status === TicketStatus.IN_PROGRESS && (
              <ButtonComplete ticketId={ticket.id} />
            )}

            {ticket.status !== TicketStatus.CANCELLED &&
              ticket.status !== TicketStatus.COMPLETED && (
                <ButtonCancel ticketId={ticket.id} />
              )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Nombre:</label>
                <p>{ticket.requesterName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono:</label>
                <p>{ticket.requesterPhone}</p>
              </div>
              {ticket.location && !isValidCoordinates(ticket.location) && (
                <div>
                  <label className="text-sm font-medium">Ubicación:</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.municipality}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Descripción:</label>
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Tipo de Servicio:</label>
                <p>{TicketTypeLabels[ticket.serviceType]}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estado: </label>
                <Badge
                  variant={
                    ticket.status === TicketStatus.PENDING
                      ? "destructive"
                      : ticket.status === TicketStatus.IN_PROGRESS
                        ? "orange"
                        : ticket.status === TicketStatus.ASSIGNED
                          ? "warning"
                          : "default"
                  }
                >
                  {TicketStatusLabels[ticket.status]}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridad: </label>
                <Badge
                  variant={
                    ticket.priority === TicketPriority.HIGH
                      ? "destructive"
                      : ticket.priority === TicketPriority.MEDIUM
                        ? "orange"
                        : "success"
                  }
                >
                  {TicketPriorityLabels[ticket.priority]}
                </Badge>
              </div>

              {ticket.cancellationReason && (
                <div>
                  <label className="text-sm font-medium">
                    Motivo de cancelación: {ticket.cancellationReason}
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {ticket.location && isValidCoordinates(ticket.location) && (
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationDisplay location={ticket.location} className="w-full" />
              {ticket.municipality && (
                <p className="text-sm text-muted-foreground mt-2">
                  Municipio: {ticket.municipality}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {ticket.patient && <PatientInfoCard patient={ticket.patient} />}

        <TicketHistoryTimeline ticketId={ticket.id} />
      </div>
    </PageContainer>
  );
}

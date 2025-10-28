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
} from "~/types/tickets";
import { LocationDisplay } from "~/components/map/location-display";
import PatientInfoCard from "~/features/tickets/patient-info-card";
import ButtonComplete from "~/features/tickets/button-complete";
import ButtonCancel from "~/features/tickets/button-cancel";

// Helper function to check if location is valid coordinates
function isValidCoordinates(location: string): boolean {
  if (!location) {
    return false;
  }

  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const match = location.match(coordRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);

    // Validate coordinate ranges
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  return false;
}

interface TicketViewPageProps {
  isReferenceNumber?: boolean;
}

export default function TicketViewPage({
  isReferenceNumber = false,
}: TicketViewPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket", id, isReferenceNumber],
    queryFn: () =>
      isReferenceNumber
        ? ticketApi.getTicketByReference(Number(id))
        : ticketApi.getTicketById(id!),
  });

  if (error) {
    toast.error("Error loading ticket");
  }

  if (isLoading) {
    return <div>Loading ticket...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <PageContainer scrollable={false}>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/tickets")}>
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                Ticket #{ticket.referenceNumber}
              </h1>
              <p className="text-muted-foreground">
                Creado el {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {ticket.status !== TicketStatus.COMPLETED &&
            ticket.status !== TicketStatus.CANCELLED && (
              <div className="flex gap-2">
                <ButtonComplete ticketId={id!} />
                <ButtonCancel ticketId={id!} />
              </div>
            )}
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
                    ticket.status === "pending"
                      ? "destructive"
                      : ticket.status === "completed"
                        ? "default"
                        : "secondary"
                  }
                >
                  {TicketStatusLabels[ticket.status]}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridad: </label>
                <Badge
                  variant={
                    ticket.priority === "urgent"
                      ? "destructive"
                      : ticket.priority === "high"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {TicketPriorityLabels[ticket.priority]}
                </Badge>
              </div>
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
              <p className="text-sm text-muted-foreground mt-2">
                Municipio: {ticket.municipality}
              </p>
            </CardContent>
          </Card>
        )}

        {ticket.patientId && <PatientInfoCard patientId={ticket.patientId} />}

        {ticket.assignedTo && (
          <Card>
            <CardHeader>
              <CardTitle>Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium">Asignado a:</label>
                <p>{ticket.assignedTo}</p>
              </div>
              {ticket.assignedAt && (
                <div>
                  <label className="text-sm font-medium">
                    Fecha de asignación:
                  </label>
                  <p>{new Date(ticket.assignedAt).toLocaleDateString()}</p>
                </div>
              )}
              {ticket.completedAt && (
                <div>
                  <label className="text-sm font-medium">
                    Fecha de completado:
                  </label>
                  <p>{new Date(ticket.completedAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

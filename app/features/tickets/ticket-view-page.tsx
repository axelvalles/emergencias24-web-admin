import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "~/http/api-server";
import {
  TicketStatus,
  TicketTypeLabels,
  TicketStatusLabels,
  TicketPriorityLabels,
} from "~/types/tickets";
import { AlertModal } from "~/components/modal/alert-modal";
import { LocationDisplay } from "~/components/map/location-display";

// Helper function to check if location is valid coordinates
function isValidCoordinates(location: string): boolean {
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const resolveMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      return await ticketApi.updateTicketStatus(id!, TicketStatus.COMPLETED);
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(getErrorMessage(res.error));
        return;
      }

      setOpen(false);
      toast.success("Ticket resuelto exitosamente");
      // Refresh the data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onResolve = async () => {
    await resolveMutation.mutate();
  };

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
          {ticket.status !== TicketStatus.COMPLETED && (
            <Button
              onClick={() => setOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Resolver Ticket
            </Button>
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
              {!isValidCoordinates(ticket.location) && (
                <div>
                  <label className="text-sm font-medium">Ubicación:</label>
                  <LocationDisplay location={ticket.location} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.municipality}
                  </p>
                </div>
              )}
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
              {ticket.patientId && (
                <div>
                  <label className="text-sm font-medium">ID Paciente:</label>
                  <p>{ticket.patientId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isValidCoordinates(ticket.location) && (
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

        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
            {ticket.additionalNotes && (
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Notas Adicionales:
                </label>
                <p className="whitespace-pre-wrap mt-1">
                  {ticket.additionalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

        <AlertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={onResolve}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}

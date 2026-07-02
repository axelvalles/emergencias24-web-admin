import { useState } from "react";
import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  IconArrowLeft,
  IconUser,
  IconPlayerPlay,
  IconCheck,
  IconX,
  IconCircle,
  IconCircleCheck,
  IconUserCheck,
  IconClock,
  IconNavigation,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import {
  getUserDisplayName,
  TICKET_OWNER_ROLE,
  TicketOwnerRoleLabels,
  TicketStatus,
  TicketTypeLabels,
  TicketStatusLabels,
  TicketPriorityLabels,
  TicketPriority,
} from "~/types/tickets";
import { LocationDisplay } from "~/components/map/location-display";
import PatientInfoCard from "~/features/tickets/patient-info-card";
import TicketActionDialog, {
  type TicketAction,
} from "~/features/tickets/ticket-action-dialog";
import TicketHistoryTimeline from "~/features/tickets/ticket-history-timeline";
import { isValidCoordinates } from "~/lib/validate-coordinates";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";

const STATUS_FLOW = [
  { status: TicketStatus.PENDING, label: "Pendiente", icon: IconCircle },
  { status: TicketStatus.ASSIGNED, label: "Asignado", icon: IconUserCheck },
  {
    status: TicketStatus.IN_PROGRESS,
    label: "En Progreso",
    icon: IconPlayerPlay,
  },
  {
    status: TicketStatus.COMPLETED,
    label: "Completado",
    icon: IconCircleCheck,
  },
];

function getStatusStep(status: TicketStatus): number {
  switch (status) {
    case TicketStatus.PENDING:
      return 0;
    case TicketStatus.ASSIGNED:
      return 1;
    case TicketStatus.IN_PROGRESS:
      return 2;
    case TicketStatus.COMPLETED:
      return 3;
    default:
      return -1;
  }
}

function getPriorityVariant(priority: TicketPriority) {
  switch (priority) {
    case TicketPriority.HIGH:
      return "destructive";
    case TicketPriority.MEDIUM:
      return "orange";
    case TicketPriority.LOW:
      return "default";
  }
}

function getStatusBadgeVariant(status: TicketStatus) {
  switch (status) {
    case TicketStatus.PENDING:
      return "destructive";
    case TicketStatus.IN_PROGRESS:
      return "orange";
    case TicketStatus.ASSIGNED:
      return "warning";
    case TicketStatus.COMPLETED:
      return "success";
    case TicketStatus.CANCELLED:
      return "secondary";
    default:
      return "default";
  }
}

function getUserOwnerRole(role?: UserRole | null) {
  switch (role) {
    case UserRole.PARAMEDIC:
      return TICKET_OWNER_ROLE.PARAMEDIC;
    case UserRole.DOCTOR:
      return TICKET_OWNER_ROLE.DOCTOR;
    case UserRole.APPOINTMENT_MANAGER:
      return TICKET_OWNER_ROLE.APPOINTMENT_MANAGER;
    case UserRole.MARKETING:
      return TICKET_OWNER_ROLE.MARKETING;
    default:
      return null;
  }
}

function formatPhoneForDisplay(phone?: string | null) {
  if (!phone) {
    return "No especificado";
  }

  return phone.replace(/^whatsapp:/i, "");
}

function buildNavigationUrl(location: string) {
  const destination = encodeURIComponent(location.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

function buildRouteWithCurrentLocationUrl(location: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.trim())}&travelmode=driving`;
}

function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
    );
  });
}

export default function TicketViewPage() {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [actionDialog, setActionDialog] = useState<{
    action: TicketAction;
    open: boolean;
  }>({
    action: "assign",
    open: false,
  });

  const [isFollowingRoute, setIsFollowingRoute] = useState(false);

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket-by-reference", referenceNumber],
    queryFn: () => ticketApi.getTicketByReference(Number(referenceNumber)),
  });

  if (error) {
    toast.error("Error al cargar el ticket");
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Cargando ticket...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!ticket) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Ticket no encontrado</p>
        </div>
      </PageContainer>
    );
  }

  const currentStep = getStatusStep(ticket.status);
  const isCanceled = ticket.status === TicketStatus.CANCELLED;
  const canAssignTicket =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.DISPATCHER ||
    currentUser?.role === UserRole.SUPER_ADMIN;
  const canCancelTicket = canAssignTicket;
  const userOwnerRole = getUserOwnerRole(currentUser?.role);
  const isAssignedToCurrentAmbulance =
    currentUser?.role === UserRole.PARAMEDIC &&
    ticket.assignedUnit?.id === currentUser.activeAmbulanceUnit?.id;
  const isOwnedByCurrentOperationalRole =
    Boolean(userOwnerRole) && ticket.currentOwnerRole === userOwnerRole;
  const canAdvanceTicket =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.DISPATCHER ||
    currentUser?.role === UserRole.SUPER_ADMIN ||
    (isOwnedByCurrentOperationalRole &&
      currentUser?.role !== UserRole.PARAMEDIC) ||
    isAssignedToCurrentAmbulance;

  return (
    <PageContainer scrollable={false}>
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => navigate("/tickets")}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="flex h-full flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6 overflow-y-auto">
            <div className="space-y-6">
              <Card className="border-t-4 border-t-primary overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                          #{ticket.referenceNumber}
                        </h1>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {TicketStatusLabels[ticket.status]}
                        </Badge>
                        {isCanceled && (
                          <Badge variant="secondary" className="text-xs">
                            Cancelado
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconClock className="h-4 w-4" />
                          Creado{" "}
                          {format(ticket.createdAt, "dd/MM/yyyy hh:mm a")}
                        </span>
                        <Badge variant={getPriorityVariant(ticket.priority)}>
                          {TicketPriorityLabels[ticket.priority]}
                        </Badge>
                        <span>{TicketTypeLabels[ticket.serviceType]}</span>
                        {ticket.currentOwnerRole && (
                          <Badge variant="outline">
                            {TicketOwnerRoleLabels[ticket.currentOwnerRole]}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {ticket.assignedUnit && (
                      <div className="flex w-full items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 lg:max-w-xs">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {ticket.assignedUnit.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {ticket.assignedUnit.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Asignado{" "}
                            {ticket.assignedAt &&
                              formatDistanceToNow(new Date(ticket.assignedAt), {
                                addSuffix: true,
                              })}
                          </p>
                        </div>
                        {isAssignedToCurrentAmbulance &&
                          ticket.location &&
                          isValidCoordinates(ticket.location) && (
                            <Button
                              size="sm"
                              variant="default"
                              className="shrink-0"
                              onClick={async () => {
                                setIsFollowingRoute(true);
                                try {
                                  const position = await getCurrentPosition();
                                  const url = `https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lng}&destination=${encodeURIComponent(ticket.location!)}&travelmode=driving`;
                                  window.open(url, "_blank");
                                } catch {
                                  toast.error(
                                    "No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación.",
                                  );
                                  window.open(
                                    buildRouteWithCurrentLocationUrl(
                                      ticket.location!,
                                    ),
                                    "_blank",
                                  );
                                } finally {
                                  setIsFollowingRoute(false);
                                }
                              }}
                              disabled={isFollowingRoute}
                            >
                              <IconNavigation className="mr-1 h-4 w-4" />
                              {isFollowingRoute
                                ? "Obteniendo..."
                                : "Seguir ruta"}
                            </Button>
                          )}
                      </div>
                    )}
                  </div>

                  {!isCanceled && (
                    <div className="mt-6">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-medium">
                          Progreso del Ticket
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Paso {currentStep + 1} de {STATUS_FLOW.length}
                        </span>
                      </div>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex min-w-[32rem] items-center">
                          {STATUS_FLOW.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;
                            const isLast = index === STATUS_FLOW.length - 1;

                            return (
                              <div
                                key={step.status}
                                className="flex flex-1 items-center"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                                      isCompleted &&
                                        "bg-primary border-primary text-primary-foreground",
                                      isCurrent &&
                                        "bg-primary/10 border-primary text-primary",
                                      !isCompleted &&
                                        !isCurrent &&
                                        "bg-muted border-muted-foreground/30 text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <span
                                    className={cn(
                                      "text-xs mt-2 font-medium",
                                      isCurrent && "text-primary",
                                      !isCurrent && "text-muted-foreground",
                                    )}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {!isLast && (
                                  <div
                                    className={cn(
                                      "flex-1 h-0.5 mx-2",
                                      isCompleted ? "bg-primary" : "bg-muted",
                                    )}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Información del Solicitante
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Nombre
                        </label>
                        <p className="font-medium">{ticket.requesterName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Teléfono
                        </label>
                        <p className="break-all font-medium">
                          {formatPhoneForDisplay(ticket.requesterPhone)}
                        </p>
                      </div>
                    </div>
                    {ticket.location &&
                      !isValidCoordinates(ticket.location) && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Ubicación
                          </label>
                          <p className="text-sm">{ticket.location}</p>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={buildNavigationUrl(ticket.location)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Abrir ruta
                            </a>
                          </Button>
                        </div>
                      )}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Descripción
                      </label>
                      <p className="text-sm whitespace-pre-wrap mt-1">
                        {ticket.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Detalles del Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Tipo de Servicio
                        </label>
                        <p className="text-sm">
                          {TicketTypeLabels[ticket.serviceType]}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Especialidad
                        </label>
                        <p className="text-sm">
                          {ticket.speciality || "No asignada"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Municipio
                        </label>
                        <p className="text-sm">
                          {ticket.municipality || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Última Actualización
                        </label>
                        <p className="text-sm">
                          {format(ticket.updatedAt, "dd/MM/yyyy hh:mm a")}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Responsable actual
                        </label>
                        <p className="text-sm">
                          {ticket.currentOwnerRole
                            ? TicketOwnerRoleLabels[ticket.currentOwnerRole]
                            : "Gestión administrativa"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {ticket.location && isValidCoordinates(ticket.location) && (
                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">Ubicación</CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={buildNavigationUrl(ticket.location)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir ruta
                      </a>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <LocationDisplay
                      location={ticket.location}
                      className="w-full h-[300px] rounded-lg overflow-hidden"
                    />
                  </CardContent>
                </Card>
              )}

              {ticket.patient && <PatientInfoCard patient={ticket.patient} />}

              <TicketHistoryTimeline ticketId={ticket.id} />
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <div className="space-y-6 lg:sticky lg:top-6">
              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {canAssignTicket &&
                    (ticket.status === TicketStatus.PENDING ||
                      ticket.status === TicketStatus.ASSIGNED) && (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10"
                        onClick={() =>
                          setActionDialog({ action: "assign", open: true })
                        }
                      >
                        <IconUser className="mr-2 h-4 w-4" />
                        {ticket.assignedAt || ticket.currentOwnerRole
                          ? "Reasignar"
                          : "Asignar"}
                      </Button>
                    )}

                  {canAdvanceTicket &&
                    ticket.status === TicketStatus.ASSIGNED && (
                      <Button
                        variant="default"
                        className="w-full justify-start h-10"
                        onClick={() =>
                          setActionDialog({ action: "start", open: true })
                        }
                      >
                        <IconPlayerPlay className="mr-2 h-4 w-4" />
                        Iniciar
                      </Button>
                    )}

                  {canAdvanceTicket &&
                    ticket.status === TicketStatus.IN_PROGRESS && (
                      <Button
                        variant="default"
                        className="w-full justify-start h-10 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          setActionDialog({ action: "complete", open: true })
                        }
                      >
                        <IconCheck className="mr-2 h-4 w-4" />
                        Completar
                      </Button>
                    )}

                  {canCancelTicket &&
                    !isCanceled &&
                    ticket.status !== TicketStatus.COMPLETED && (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setActionDialog({ action: "cancel", open: true })
                        }
                      >
                        <IconX className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    )}

                  {isCanceled && (
                    <div className="text-center py-3 text-muted-foreground text-sm bg-muted/50 rounded-md">
                      Ticket cancelado
                    </div>
                  )}

                  {ticket.status === TicketStatus.COMPLETED && !isCanceled && (
                    <div className="text-center py-3 text-green-600 text-sm bg-green-50 rounded-md font-medium">
                      Ticket completado
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                      {TicketStatusLabels[ticket.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Prioridad</span>
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {TicketPriorityLabels[ticket.priority]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Responsable</span>
                    <span>
                      {ticket.currentOwnerRole
                        ? TicketOwnerRoleLabels[ticket.currentOwnerRole]
                        : "Gestión administrativa"}
                    </span>
                  </div>
                  {ticket.resolvedBy && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Resuelto por
                      </span>
                      <span>{getUserDisplayName(ticket.resolvedBy)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{format(ticket.createdAt, "dd/MM/yyyy")}</span>
                  </div>
                  {ticket.completedAt && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Completado</span>
                      <span>{format(ticket.completedAt, "dd/MM/yyyy")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <TicketActionDialog
          action={actionDialog.action}
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
          ticketId={ticket.id}
          ticket={ticket}
        />
      </div>
    </PageContainer>
  );
}

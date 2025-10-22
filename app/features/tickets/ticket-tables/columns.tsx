import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text, Ambulance, Stethoscope, Phone, Home, TestTube, Calendar, Heart, Clock, User, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { Ticket } from "~/types/tickets";
import {
  TicketStatusLabels,
  TicketTypeLabels,
  TicketPriorityLabels,
  TicketType,
  TicketStatus,
} from "~/types/tickets";
import { CellAction } from "./cell-action";

// Icon mapping for ticket types
const getTicketTypeIcon = (type: TicketType) => {
  switch (type) {
    case TicketType.IMMEDIATE_ATTENTION:
    case TicketType.IMMEDIATE_CARE:
      return Heart;
    case TicketType.AMBULANCE:
      return Ambulance;
    case TicketType.TELEMEDICINE:
      return Phone;
    case TicketType.HOME_CARE:
      return Home;
    case TicketType.LABORATORY:
      return TestTube;
    case TicketType.APPOINTMENT:
      return Calendar;
    default:
      return Stethoscope;
  }
};

// Icon mapping for ticket status
const getTicketStatusIcon = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.PENDING:
      return Clock;
    case TicketStatus.ASSIGNED:
      return User;
    case TicketStatus.IN_PROGRESS:
      return RefreshCw;
    case TicketStatus.COMPLETED:
      return CheckCircle;
    case TicketStatus.CANCELLED:
      return XCircle;
    default:
      return Text;
  }
};

export const columns: ColumnDef<Ticket>[] = [
  {
    id: "referenceNumber",
    accessorKey: "referenceNumber",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Número de Referencia" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Ticket["referenceNumber"]>()}</div>,
    meta: {
      label: "Número de Referencia",
      placeholder: "Buscar por número...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "requesterName",
    accessorKey: "requesterName",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Solicitante" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Ticket["requesterName"]>()}</div>,
    meta: {
      label: "Solicitante",
      placeholder: "Buscar por nombre...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "serviceType",
    accessorKey: "serviceType",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Tipo de Servicio" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Ticket["serviceType"]>();
      return <div>{TicketTypeLabels[value] || value}</div>;
    },
    meta: {
      label: "Tipo de Servicio",
      placeholder: "Filtrar por tipo...",
      variant: "multiSelect",
      options: Object.entries(TicketTypeLabels).map(([value, label]) => ({
        label,
        value,
        icon: getTicketTypeIcon(value as TicketType),
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Ticket["status"]>();
      const label = TicketStatusLabels[value] || value;
      return (
        <Badge
          variant={
            value === "pending"
              ? "destructive"
              : value === "completed"
                ? "default"
                : "secondary"
          }
        >
          {label}
        </Badge>
      );
    },
    meta: {
      label: "Estado",
      placeholder: "Filtrar por estado...",
      variant: "multiSelect",
      options: Object.entries(TicketStatusLabels).map(([value, label]) => ({
        label,
        value,
        icon: getTicketStatusIcon(value as TicketStatus),
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Ticket["priority"]>();
      const label = TicketPriorityLabels[value] || value;
      return (
        <Badge
          variant={
            value === "urgent"
              ? "destructive"
              : value === "high"
                ? "destructive"
                : "secondary"
          }
        >
          {label}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }: { column: Column<Ticket, unknown> }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creación" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Ticket["createdAt"]>();
      return <div>{new Date(value).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

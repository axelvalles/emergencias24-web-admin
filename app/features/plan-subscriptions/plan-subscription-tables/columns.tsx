import type { ColumnDef, Column } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import {
  PlanSubscriptionStatus,
  PlanSubscriptionStatusLabels,
  PayerTypeLabels,
  type PlanSubscription,
} from "~/types/plan-subscriptions";
import { PlanType, PlanTypeLabels } from "~/types/plans";
import { CellAction } from "./cell-action";

const statusFilterOptions = Object.entries(PlanSubscriptionStatusLabels).map(
  ([value, label]) => ({
    label,
    value,
  })
);

const payerTypeFilterOptions = Object.entries(PayerTypeLabels).map(
  ([value, label]) => ({
    label,
    value,
  })
);

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const getStatusVariant = (status: PlanSubscriptionStatus) => {
  switch (status) {
    case PlanSubscriptionStatus.ACTIVE:
      return "default";
    case PlanSubscriptionStatus.SUSPENDED:
      return "secondary";
    case PlanSubscriptionStatus.CANCELED:
      return "destructive";
    case PlanSubscriptionStatus.EXPIRED:
      return "outline";
    default:
      return "secondary";
  }
};

const getPlanTypeVariant = (planType?: PlanType) => {
  switch (planType) {
    case PlanType.CORPORATE:
      return "secondary";
    case PlanType.GROUP:
      return "outline";
    case PlanType.FAMILY:
      return "default";
    default:
      return "secondary";
  }
};

export const columns: ColumnDef<PlanSubscription>[] = [
  {
    id: "patient",
    accessorFn: (row) => row.patient?.fullName ?? "",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Paciente" />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{patient?.fullName ?? "—"}</p>
          {patient?.documentNumber && (
            <p className="text-sm text-muted-foreground">
              {patient.documentNumber}
            </p>
          )}
        </div>
      );
    },
    meta: {
      label: "Paciente",
      placeholder: "Buscar por paciente...",
      variant: "text",
    },
    enableColumnFilter: false,
  },
  {
    id: "plan",
    accessorFn: (row) => row.plan?.name ?? "",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Plan" />
    ),
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{plan?.name ?? "—"}</p>
          {plan?.planType && (
            <Badge variant={getPlanTypeVariant(plan.planType)}>
              {PlanTypeLabels[plan.planType]}
            </Badge>
          )}
        </div>
      );
    },
    meta: {
      label: "Plan",
      placeholder: "Buscar por plan...",
      variant: "text",
    },
    enableColumnFilter: false,
  },
  {
    id: "payerType",
    accessorKey: "payerType",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Pagador" />
    ),
    cell: ({ row }) => {
      const { payerType, company } = row.original;
      return (
        <div className="space-y-1">
          <Badge variant="outline">{PayerTypeLabels[payerType]}</Badge>
          {company && (
            <p className="text-sm text-muted-foreground">{company.name}</p>
          )}
        </div>
      );
    },
    meta: {
      label: "Tipo de pagador",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: payerTypeFilterOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {PlanSubscriptionStatusLabels[row.original.status]}
      </Badge>
    ),
    meta: {
      label: "Estado",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: statusFilterOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: "startDate",
    accessorKey: "startDate",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Fecha inicio" />
    ),
    cell: ({ row }) => formatDate(row.original.startDate),
    enableColumnFilter: false,
  },
  {
    id: "endDate",
    accessorKey: "endDate",
    header: ({ column }: { column: Column<PlanSubscription> }) => (
      <DataTableColumnHeader column={column} title="Fecha fin" />
    ),
    cell: ({ row }) => formatDate(row.original.endDate),
    enableColumnFilter: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

import type { Column, ColumnDef } from "@tanstack/react-table";

import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import {
  PlanBillingPeriodLabels,
  PlanStatus,
  PlanStatusLabels,
  PlanTypeLabels,
  type Plan,
} from "~/types/plans";
import { CellAction } from "./cell-action";

const planTypeFilterOptions = Object.entries(PlanTypeLabels).map(
  ([value, label]) => ({
    label,
    value,
  })
);

const planBillingPeriodFilterOptions = Object.entries(
  PlanBillingPeriodLabels
).map(([value, label]) => ({
  label,
  value,
}));

const planStatusFilterOptions = Object.entries(PlanStatusLabels).map(
  ([value, label]) => ({
    label,
    value,
  })
);

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${value}`;
  }
};

export const columns: ColumnDef<Plan>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const { name, description } = row.original;
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{name}</p>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>
      );
    },
    meta: {
      label: "Nombre",
    },
    enableColumnFilter: false,
  },
  {
    id: "planType",
    accessorKey: "planType",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => PlanTypeLabels[row.original.planType],
    meta: {
      label: "Tipo de plan",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: planTypeFilterOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: "billingPeriod",
    accessorKey: "billingPeriod",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Periodo de cobro" />
    ),
    cell: ({ row }) => PlanBillingPeriodLabels[row.original.billingPeriod],
    meta: {
      label: "Periodo de cobro",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: planBillingPeriodFilterOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === PlanStatus.ACTIVE ? "default" : "secondary"
        }
      >
        {PlanStatusLabels[row.original.status]}
      </Badge>
    ),
    meta: {
      label: "Estado",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: planStatusFilterOptions,
    },
    enableColumnFilter: true,
  },
  {
    id: "benefitsCount",
    accessorKey: "benefitsCount",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Beneficios" />
    ),
    cell: ({ row }) => {
      const benefitsCount = row.original.benefitsCount ?? 0;
      return <Badge variant={benefitsCount > 0 ? "secondary" : "outline"}>{benefitsCount}</Badge>;
    },
    enableColumnFilter: false,
  },
  {
    id: "activeSubscriptionsCount",
    accessorKey: "activeSubscriptionsCount",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Suscripciones activas" />
    ),
    cell: ({ row }) => {
      const count = row.original.activeSubscriptionsCount ?? 0;
      return <Badge variant={count > 0 ? "secondary" : "outline"}>{count}</Badge>;
    },
    enableColumnFilter: false,
  },
  {
    id: "monthlyCost",
    accessorKey: "monthlyCost",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Monto de cobro" />
    ),
    cell: ({ row }) => formatCurrency(row.original.monthlyCost),
    meta: {
      label: "Monto de cobro",
      variant: "price",
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

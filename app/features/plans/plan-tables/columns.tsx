import type { ColumnDef, Column } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import {
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
      placeholder: "Buscar por nombre...",
      variant: "text",
    },
    enableColumnFilter: true,
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
    id: "monthlyCost",
    accessorKey: "monthlyCost",
    header: ({ column }: { column: Column<Plan> }) => (
      <DataTableColumnHeader column={column} title="Costo mensual" />
    ),
    cell: ({ row }) => formatCurrency(row.original.monthlyCost),
    meta: {
      label: "Costo mensual",
      variant: "price",
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

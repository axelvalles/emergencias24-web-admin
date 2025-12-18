import type { ColumnDef, Column } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import {
  type Company,
  CompanyStatus,
  CompanyStatusLabels,
} from "~/types/companies";
import { CellAction } from "./cell-action";

const statusFilterOptions = Object.entries(CompanyStatusLabels).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const columns: ColumnDef<Company>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Company> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const { name, taxId } = row.original;
      return (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{taxId}</p>
        </div>
      );
    },
    meta: {
      label: "Nombre",
      placeholder: "Buscar...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    id: "contactEmail",
    accessorKey: "contactEmail",
    header: ({ column }: { column: Column<Company> }) => (
      <DataTableColumnHeader column={column} title="Contacto" />
    ),
    cell: ({ row }) => {
      const { contactEmail, contactPhone } = row.original;
      return (
        <div className="space-y-1">
          <p className="text-sm">{contactEmail}</p>
          <p className="text-xs text-muted-foreground">{contactPhone}</p>
        </div>
      );
    },
    meta: {
      label: "Email",
      placeholder: "Buscar...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Company> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === CompanyStatus.ACTIVE ? "default" : "secondary"
        }
      >
        {CompanyStatusLabels[row.original.status]}
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
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

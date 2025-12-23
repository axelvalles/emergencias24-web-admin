import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { CellAction } from "./cell-action";
import { PatientStatusLabels, type Patient } from "~/types/patients";
import { Badge } from "~/components/ui/badge";

export const columns: ColumnDef<Patient>[] = [
  {
    id: "documentNumber",
    accessorKey: "documentNumber",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["documentNumber"]>()}</div>,
    meta: {
      label: "Documento",
      placeholder: "Buscar...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "fullName",
    accessorKey: "fullName",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["fullName"]>()}</div>,
    meta: {
      label: "Nombre",
      placeholder: "Buscar...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "birthDate",
    accessorKey: "birthDate",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Fecha de nacimiento" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["birthDate"]>()}</div>,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Patient["status"]>();
      const label = PatientStatusLabels[status];
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";

      if (status === "Inactive") variant = "secondary";
      if (status === "Deceased") variant = "destructive";

      return <Badge variant={variant}>{label}</Badge>;
    },
    meta: {
      label: "Estado",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: Object.entries(PatientStatusLabels).map(([value, label]) => ({
        label,
        value,
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { CellAction } from "./cell-action";
import type { AmbulanceUnit } from "~/types/ambulance-units";

export const columns: ColumnDef<AmbulanceUnit>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<AmbulanceUnit, unknown> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: "Nombre",
      icon: Text,
    },
    enableColumnFilter: false,
  },
  {
    id: "membersCount",
    accessorKey: "membersCount",
    header: ({ column }: { column: Column<AmbulanceUnit, unknown> }) => (
      <DataTableColumnHeader column={column} title="Tripulacion" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>()}</div>,
    meta: {
      label: "Tripulacion",
      icon: Text,
    },
    enableColumnFilter: false,
  },
  {
    id: "activeUsersCount",
    accessorKey: "activeUsersCount",
    header: ({ column }: { column: Column<AmbulanceUnit, unknown> }) => (
      <DataTableColumnHeader column={column} title="Usuarios activos" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<number>()}</div>,
    meta: {
      label: "Usuarios activos",
      icon: Text,
    },
    enableColumnFilter: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }: { column: Column<AmbulanceUnit, unknown> }) => (
      <DataTableColumnHeader column={column} title="Fecha de creacion" />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Date>();
      return (
        <div>
          {new Intl.DateTimeFormat("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(new Date(date))}
        </div>
      );
    },
    meta: {
      label: "Fecha de creacion",
      icon: Text,
    },
    enableColumnFilter: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
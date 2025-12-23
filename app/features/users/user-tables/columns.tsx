import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { CellAction } from "./cell-action";
import { UserRoleLabels, type User } from "~/types/users";
import { Badge } from "~/components/ui/badge";

export const columns: ColumnDef<User>[] = [
  {
    id: "fullName",
    accessorKey: "fullName",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User["fullName"]>()}</div>,
    meta: {
      label: "Nombre",
      placeholder: "Buscar...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User["email"]>()}</div>,
    meta: {
      label: "Email",
      placeholder: "Buscar...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Telefono" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User["phone"]>()}</div>,
    meta: {
      label: "Telefono",
      placeholder: "Buscar...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ cell }) => (
      <div>{UserRoleLabels[cell.getValue<User["role"]>()]}</div>
    ),
    meta: {
      label: "Rol",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: Object.entries(UserRoleLabels).map(([value, label]) => ({
        label,
        value,
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status === "ACTIVE" ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    meta: {
      label: "Estado",
      placeholder: "Seleccionar...",
      variant: "multiSelect",
      options: [
        { label: "Activo", value: "ACTIVE" },
        { label: "Inactivo", value: "INACTIVE" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

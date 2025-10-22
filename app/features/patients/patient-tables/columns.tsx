import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { CellAction } from "./cell-action";
import { AvatarNext } from "~/components/ui/avatar";
import type { Patient } from "~/http/patient-api";

export const columns: ColumnDef<Patient>[] = [
  {
    id: "first_name",
    accessorKey: "first_name",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["first_name"]>()}</div>,
    meta: {
      label: "Name",
      placeholder: "Search patients...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "last_name",
    accessorKey: "last_name",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="last_name" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["last_name"]>()}</div>,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["phone"]>()}</div>,
  },
  {
    id: "birth_date",
    accessorKey: "birth_date",
    header: ({ column }: { column: Column<Patient, unknown> }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Patient["birth_date"]>()}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

import type { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/ui/table/data-table-column-header";
import type { Benefit } from "~/types/benefits";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Benefit>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }: { column: Column<Benefit> }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    meta: {
      label: "Nombre",
      icon: Text,
    },
    enableColumnFilter: false,
  },
  {
    id: "plansCount",
    accessorKey: "plansCount",
    header: ({ column }: { column: Column<Benefit> }) => (
      <DataTableColumnHeader column={column} title="Planes asociados" />
    ),
    cell: ({ row }) => {
      const plansCount = row.original.plansCount ?? 0;
      return <Badge variant={plansCount > 0 ? "secondary" : "outline"}>{plansCount}</Badge>;
    },
    enableColumnFilter: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

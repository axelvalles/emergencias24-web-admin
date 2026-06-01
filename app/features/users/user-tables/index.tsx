import { DataTable } from "~/components/ui/table/data-table";
import { DataTableToolbar } from "~/components/ui/table/data-table-toolbar";

import { useDataTable } from "~/hooks/use-data-table";

import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

interface UserTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isFetching: boolean;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
}
export function UserTable<TData, TValue>({
  data = [],
  totalItems = 0,
  columns,
  isFetching,
  globalSearch,
  onGlobalSearchChange,
}: UserTableParams<TData, TValue>) {
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    debounceMs: 500,
  });

  return (
    <DataTable table={table} isFetching={isFetching}>
      <DataTableToolbar
        table={table}
        globalSearch={{
          value: globalSearch,
          onChange: onGlobalSearchChange,
          placeholder: "Buscar por nombre, email o telefono...",
          label: "Busqueda",
        }}
      />
    </DataTable>
  );
}

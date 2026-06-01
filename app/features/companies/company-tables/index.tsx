import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

import { DataTable } from "~/components/ui/table/data-table";
import { DataTableToolbar } from "~/components/ui/table/data-table-toolbar";
import { useDataTable } from "~/hooks/use-data-table";

interface CompanyTableProps<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isFetching: boolean;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
}

export function CompanyTable<TData, TValue>({
  data = [],
  totalItems = 0,
  columns,
  isFetching,
  globalSearch,
  onGlobalSearchChange,
}: CompanyTableProps<TData, TValue>) {
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    debounceMs: 500,
    shallow: false,
  });

  return (
    <DataTable table={table} isFetching={isFetching}>
      <DataTableToolbar
        table={table}
        globalSearch={{
          value: globalSearch,
          onChange: onGlobalSearchChange,
          placeholder: "Buscar por nombre, RIF/NIT, email o telefono...",
          label: "Busqueda",
        }}
      />
    </DataTable>
  );
}

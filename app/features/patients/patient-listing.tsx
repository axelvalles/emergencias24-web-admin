import { patientApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PatientTable } from "./patient-tables";
import { columns } from "./patient-tables/columns";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import { Button } from "~/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsJson,
  parseAsArrayOf,
} from "nuqs";
import z from "zod";
import { PatientStatus } from "~/types/patients";
import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import { canAccessRole } from "~/lib/access-control";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";
import { PatientImportDialog } from "./patient-import-dialog";

const sortSchema = z.array(z.object({ id: z.string(), desc: z.boolean() }));

const toEnumArray = <T extends string>(
  values: string[] | null,
  allowed: readonly T[]
) => {
  if (!values || values.length === 0) {
    return undefined;
  }

  const filtered = values.filter((value): value is T =>
    allowed.includes(value as T)
  );

  return filtered.length > 0 ? filtered : undefined;
};

export default function PatientListingPage() {
  const user = useAuthStore((state) => state.user);
  const canManagePatients = canAccessRole(user?.role, [UserRole.ADMIN]);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const filters = {
    page,
    limit: pageLimit,
    q: search.trim() || undefined,
    status: toEnumArray(status, Object.values(PatientStatus)),
    sortBy,
    sortOrder,
  };

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setSearch(value);
  }, 400);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["patients", filters],
    queryFn: () => patientApi.getAllPatients(filters),
  });

  if (error) {
    toast.error("Error al cargar los pacientes");
  }

  const patients = data?.data || [];
  const totalItems = data?.total || 0;

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;
  }

  const handleDownloadTemplate = async () => {
    try {
      await patientApi.downloadTemplate();
      toast.success("Plantilla descargada exitosamente");
    } catch (error) {
      toast.error("Error al descargar la plantilla");
    }
  };

  return (
    <div className="space-y-4">
      {canManagePatients && (
        <div className="flex gap-2">
          <Button onClick={handleDownloadTemplate} variant="outline">
            <IconDownload className="w-4 h-4" />
            Descargar Plantilla
          </Button>
          <PatientImportDialog
            onImported={async () => {
              await refetch();
            }}
          />
        </div>
      )}
      <PatientTable
        data={patients}
        totalItems={totalItems}
        columns={
          canManagePatients
            ? columns
            : columns.filter((column) => column.id !== "actions")
        }
        isFetching={isFetching}
        globalSearch={search}
        onGlobalSearchChange={debouncedSetSearch}
      />
    </div>
  );
}

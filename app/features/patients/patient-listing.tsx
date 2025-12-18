import { patientApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PatientTable } from "./patient-tables";
import { columns } from "./patient-tables/columns";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsJson,
  parseAsArrayOf,
} from "nuqs";
import z from "zod";
import { PatientStatus } from "~/types/patients";

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
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [fullName] = useQueryState("fullName", parseAsString);
  const [documentNumber] = useQueryState("documentNumber", parseAsString);
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const filters = {
    page,
    limit: pageLimit,
    fullName: fullName || undefined,
    documentNumber: documentNumber || undefined,
    status: toEnumArray(status, Object.values(PatientStatus)),
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error, isFetching } = useQuery({
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

  return (
    <PatientTable
      data={patients}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
    />
  );
}

import { searchParamsCache } from "~/lib/searchparams";
import { patientApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PatientTable } from "./patient-tables";
import { columns } from "./patient-tables/columns";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";

export default function PatientListingPage() {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.page;
  const search = searchParamsCache.name;
  const pageLimit = searchParamsCache.perPage;

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
  };

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientApi.getAllPatients(),
  });

  if (error) {
    toast.error("Error al cargar los pacientes");
  }

  // const totalPatients = data?.data?.totalCount || 0;
  // const patients = data?.data?.items || [];

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;
  }

  return <PatientTable data={data} totalItems={10} columns={columns} />;
}

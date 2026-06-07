import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import AmbulanceUnitForm from "~/features/ambulance-units/ambulance-unit-form";
import { toast } from "sonner";
import { ambulanceUnitApi, getErrorMessage } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";

export default function EditAmbulanceUnit() {
  const { id = "" } = useParams();

  const {
    data: unitData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ambulance-unit", id],
    queryFn: () => ambulanceUnitApi.getUnitById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <div>Cargando unidad...</div>;
  }

  if (!unitData) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <AmbulanceUnitForm initialData={unitData} pageTitle={"Editar unidad de ambulancia"} />
      </div>
    </PageContainer>
  );
}
import PageContainer from "~/components/layout/page-container";
import AmbulanceUnitForm from "~/features/ambulance-units/ambulance-unit-form";

export default function CreateAmbulanceUnit() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <AmbulanceUnitForm initialData={null} pageTitle={"Crear unidad de ambulancia"} />
      </div>
    </PageContainer>
  );
}
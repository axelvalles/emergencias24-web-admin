import PageContainer from "~/components/layout/page-container";
import PatientForm from "~/features/patients/patient-form";

export default function CreatePatient() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <PatientForm initialData={null} pageTitle={"Crear paciente"} />
      </div>
    </PageContainer>
  );
}

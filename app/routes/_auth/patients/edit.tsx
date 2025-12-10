import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import PatientForm from "~/features/patients/patient-form";
import { toast } from "sonner";
import { patientApi } from "~/http/patient-api";
import { useQuery } from "@tanstack/react-query";

export default function EditPatient() {
  const { id } = useParams();

  const {
    data: patientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => {
      return patientApi.getPatientById(Number(id));
    },
  });

  if (error) {
    toast.error("Error al cargar el paciente");
  }

  if (isLoading) {
    return <div>Cargando paciente...</div>;
  }

  console.log(patientData, isLoading);

  if (patientData && !isLoading) {
    return (
      <PageContainer scrollable>
        <div className="flex-1 space-y-4">
          <PatientForm
            initialData={patientData}
            pageTitle={"Editar paciente"}
          />
        </div>
      </PageContainer>
    );
  }

  return null;
}

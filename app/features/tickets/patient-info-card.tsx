import { useQuery } from "@tanstack/react-query";
import { patientApi } from "~/http/patient-api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface PatientInfoCardProps {
  patientId: string;
}

export default function PatientInfoCard({ patientId }: PatientInfoCardProps) {
  const {
    data: patient,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientApi.getPatientById(patientId),
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !patient) {
    return null; // Or show an error message if needed
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <label className="text-sm font-medium">Nombre:</label>
          <p>
            {patient.first_name} {patient.last_name}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Teléfono:</label>
          <p>{patient.phone}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Número de Documento:</label>
          <p>
            {patient.document_type} {patient.document_number}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Fecha de Nacimiento:</label>
          <p>{new Date(patient.birth_date).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Género:</label>
          <p>{patient.gender}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Dirección:</label>
          <p>{patient.address || "No especificada"}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Ciudad:</label>
          <p>{patient.city || "No especificada"}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Contacto de Emergencia:</label>
          <p>
            {patient.emergency_contact_name || "No especificado"} -{" "}
            {patient.emergency_contact_phone || "No especificado"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

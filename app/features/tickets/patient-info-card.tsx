import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";
import { GenderLabels, type PatientDetail } from "~/types/patients";

interface PatientInfoCardProps {
  patient: PatientDetail;
}

export default function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <label className="text-sm font-medium">Nombre:</label>
          <p>
            {patient.firstName} {patient.lastName}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Teléfono:</label>
          <p>{patient.phone}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Número de Documento:</label>
          <p>
            {patient.documentType} {patient.documentNumber}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Fecha de Nacimiento:</label>
          <p>{format(patient.birthDate, "dd/MM/yyyy")}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Género:</label>
          <p>{GenderLabels[patient.gender]}</p>
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
            {patient.emergencyContactName || "No especificado"} -{" "}
            {patient.emergencyContactPhone || "No especificado"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

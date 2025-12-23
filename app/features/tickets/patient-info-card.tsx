import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";
import { GenderLabels, type PatientDetail } from "~/types/patients";
import { planSubscriptionApi } from "~/http/api-server";
import { PlanSubscriptionStatusLabels } from "~/types/plan-subscriptions";

interface PatientInfoCardProps {
  patient: PatientDetail;
}

export default function PatientInfoCard({ patient }: PatientInfoCardProps) {
  const { data: activePlans, isLoading } = useQuery({
    queryKey: ["patient-active-plans", patient.id],
    queryFn: () => planSubscriptionApi.findActiveByPatientId(patient.id),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nombre:</label>
            <p className="text-base">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono:</label>
            <p className="text-base">{patient.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Número de Documento:</label>
            <p className="text-base">
              {patient.documentType} {patient.documentNumber}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de Nacimiento:</label>
            <p className="text-base">{format(patient.birthDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Género:</label>
            <p className="text-base">{GenderLabels[patient.gender]}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Dirección:</label>
            <p className="text-base">{patient.address || "No especificada"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Ciudad:</label>
            <p className="text-base">{patient.city || "No especificada"}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Contacto de Emergencia:</label>
            <p className="text-base">
              {patient.emergencyContactName || "No especificado"} -{" "}
              {patient.emergencyContactPhone || "No especificado"}
            </p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Planes Activos</h3>
          {isLoading ? (
            <p className="text-base">Cargando planes...</p>
          ) : activePlans && activePlans.length > 0 ? (
            <div className="space-y-2">
              {activePlans.map((subscription) => (
                <div key={subscription.id} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-base">{subscription.plan.name}</p>
                  <p className="text-sm text-gray-600">
                    Estado: {PlanSubscriptionStatusLabels[subscription.status]} | Inicio: {format(new Date(subscription.startDate), "dd/MM/yyyy")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base">No tiene planes activos</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import PatientForm from "~/features/patients/patient-form";
import PatientSubscriptions from "~/features/patients/patient-subscriptions";
import { toast } from "sonner";
import { patientApi } from "~/http/patient-api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { IconUser, IconCreditCard } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function PatientSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditPatient() {
  const { id = "" } = useParams();

  const {
    data: patientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => {
      return patientApi.getPatientByDocument(id);
    },
  });

  if (error) {
    toast.error("Error al cargar el paciente");
  }

  if (isLoading) {
    return (
      <PageContainer scrollable>
        <div className="flex-1 space-y-4">
          <PatientSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info" className="gap-2">
              <IconUser className="h-4 w-4" />
              Información del paciente
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <IconCreditCard className="h-4 w-4" />
              Suscripciones
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4">
            <PatientForm
              initialData={patientData}
              pageTitle="Editar paciente"
            />
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-4">
            <PatientSubscriptions patientId={patientData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

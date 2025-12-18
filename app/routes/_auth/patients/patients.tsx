import { Separator } from "~/components/ui/separator";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import PatientListingPage from "~/features/patients/patient-listing";
import { cn } from "~/lib/utils";

export default function Patients() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Pacientes" description="Gestiona los pacientes." />
          <Link
            to="/pacientes/nuevo"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Agregar nuevo
          </Link>
        </div>
        <Separator />
        <PatientListingPage />
      </div>
    </PageContainer>
  );
}

import { Link } from "react-router";

import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import PlanContractForm from "~/features/plan-contracts/plan-contract-form";

export default function NewPlanContractPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Contratos de paquete"
            description="Asocia un pagador individual con los pacientes cubiertos por un plan."
          />
          <Link
            to="/suscripciones"
            className={cn(buttonVariants({ variant: "outline" }), "text-xs md:text-sm")}
          >
            Volver a suscripciones
          </Link>
        </div>
        <Separator />
        <PlanContractForm />
      </div>
    </PageContainer>
  );
}
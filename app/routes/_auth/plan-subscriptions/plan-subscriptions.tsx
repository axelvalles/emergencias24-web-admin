import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import PlanSubscriptionListingPage from "~/features/plan-subscriptions/plan-subscription-listing";
import { canAccessRole } from "~/lib/access-control";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";

export default function PlanSubscriptionsPage() {
  const user = useAuthStore((state) => state.user);
  const canManageSubscriptions = canAccessRole(user?.role, [UserRole.ADMIN]);

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Suscripciones"
            description="Administra las suscripciones de planes."
          />
          {canManageSubscriptions && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/contratos-plan/nuevo"
                className={cn(buttonVariants({ variant: "outline" }), "text-xs md:text-sm")}
              >
                Nuevo contrato de paquete
              </Link>
              <Link
                to="/suscripciones/nueva"
                className={cn(buttonVariants(), "text-xs md:text-sm")}
              >
                <IconPlus className="mr-2 h-4 w-4" /> Nueva suscripción
              </Link>
            </div>
          )}
        </div>
        <Separator />
        <PlanSubscriptionListingPage />
      </div>
    </PageContainer>
  );
}

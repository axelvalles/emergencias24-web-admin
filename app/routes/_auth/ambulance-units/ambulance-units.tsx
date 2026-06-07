import { Separator } from "~/components/ui/separator";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import AmbulanceUnitListing from "~/features/ambulance-units/ambulance-unit-listing";
import { cn } from "~/lib/utils";

export default function AmbulanceUnits() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Unidades de ambulancia" description="Gestiona las unidades de ambulancia." />
          <Link
            to="/ambulance-units/new"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Agregar nuevo
          </Link>
        </div>
        <Separator />
        <AmbulanceUnitListing />
      </div>
    </PageContainer>
  );
}

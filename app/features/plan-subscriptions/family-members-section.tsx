import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconUsers } from "@tabler/icons-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ConfirmModal } from "~/components/modal/confirm-modal";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  getErrorMessage,
  parseApiError,
  planSubscriptionApi,
} from "~/http/api-server";
import {
  type FamilyMember,
  type PlanSubscription,
  PlanSubscriptionStatus,
  PlanSubscriptionStatusLabels,
  FamilyMemberAssignmentErrorCode,
} from "~/types/plan-subscriptions";
import { FamilyMemberPatientCombobox } from "./family-member-patient-combobox";

const manageAssignFamilyMemberErrors = (error: unknown) => {
  const result = parseApiError(error);

  if (result.errorCode === FamilyMemberAssignmentErrorCode.SUBSCRIPTION_NOT_FOUND) {
    toast.error("La suscripción no fue encontrada");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.SUBSCRIPTION_NOT_ACTIVE) {
    toast.error("La suscripción no está activa");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.PLAN_NOT_FAMILY_TYPE) {
    toast.error("El plan no es de tipo familiar");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.FAMILY_MEMBER_PATIENT_NOT_FOUND) {
    toast.error("No existe pacientes con ese numero de documento");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.FAMILY_MEMBER_HAS_ACTIVE_FAMILY_PLAN) {
    toast.error("El paciente que intentas agregar ya tiene un plan familiar activo");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.FAMILY_MEMBER_IS_MAIN_SUBSCRIBER) {
    toast.error("El paciente ya es el suscriptor principal");
  } else if (result.errorCode === FamilyMemberAssignmentErrorCode.FAMILY_MEMBER_ALREADY_ASSIGNED) {
    toast.error("El paciente ya está asignado a este plan");
  } else {
    toast.error("Ocurrio un error");
  }
};

const assignFamilyMemberSchema = z.object({
  familyMemberDocumentNumber: z
    .string()
    .min(1, { message: "El número de documento es requerido" }),
});

type AssignFamilyMemberFormSchema = z.infer<typeof assignFamilyMemberSchema>;

interface FamilyMembersSectionProps {
  subscription: PlanSubscription;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const getStatusVariant = (status: PlanSubscriptionStatus) => {
  switch (status) {
    case PlanSubscriptionStatus.ACTIVE:
      return "default";
    case PlanSubscriptionStatus.SUSPENDED:
      return "secondary";
    case PlanSubscriptionStatus.CANCELED:
      return "destructive";
    case PlanSubscriptionStatus.EXPIRED:
      return "outline";
    default:
      return "secondary";
  }
};

function FamilyMemberCard({
  member,
  onRemove,
  isRemoving,
}: {
  member: FamilyMember;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ConfirmModal
        confirmText={member.patient?.fullName ?? "familiar"}
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onRemove}
        loading={isRemoving}
      />
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{member.patient?.fullName ?? "—"}</p>
            <Badge variant={getStatusVariant(member.status)}>
              {PlanSubscriptionStatusLabels[member.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {member.patient?.documentNumber ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            Vigencia: {formatDate(member.startDate)}
            {member.endDate && ` - ${formatDate(member.endDate)}`}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              disabled={isRemoving}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar familiar</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}

function FamilyMembersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-9" />
        </div>
      ))}
    </div>
  );
}

export default function FamilyMembersSection({
  subscription,
}: FamilyMembersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<AssignFamilyMemberFormSchema>({
    resolver: zodResolver(assignFamilyMemberSchema),
    defaultValues: {
      familyMemberDocumentNumber: "",
    },
  });

  // Fetch family members
  const {
    data: familyMembers,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ["family-members", subscription.id],
    queryFn: () => planSubscriptionApi.getFamilyMembers(subscription.id),
    enabled: Boolean(subscription.id),
  });

  const assignMutation = useMutation({
    mutationFn: async (values: AssignFamilyMemberFormSchema) => {
      return planSubscriptionApi.assignFamilyMember({
        subscriptionId: subscription.id,
        familyMemberDocumentNumber: values.familyMemberDocumentNumber,
      });
    },
    onSuccess: async () => {
      toast.success("Familiar agregado correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["family-members", subscription.id],
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      manageAssignFamilyMemberErrors(error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (familyMemberId: string) => {
      setRemovingId(familyMemberId);
      return planSubscriptionApi.removeFamilyMember(familyMemberId);
    },
    onSuccess: async () => {
      toast.success("Familiar eliminado correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["family-members", subscription.id],
      });
      setRemovingId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setRemovingId(null);
    },
  });

  if (membersError) {
    toast.error(getErrorMessage(membersError));
  }

  const handleSubmit = async (values: AssignFamilyMemberFormSchema) => {
    await assignMutation.mutateAsync(values);
  };

  useEffect(() => {
    if (!dialogOpen && !assignMutation.isPending) {
      form.reset();
    }
  }, [assignMutation.isPending, dialogOpen, form]);

  const excludedPatientIds = [
    subscription.patient.id,
    ...(familyMembers?.map((member) => member.patient.id) ?? []),
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Familiares</CardTitle>
              <CardDescription>Miembros del plan familiar</CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <IconPlus className="mr-2 h-4 w-4" />
                Agregar familiar
              </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar familiar al plan</DialogTitle>
                  <DialogDescription>
                    Busca el paciente por nombre o documento y agrégalo a este
                    plan.
                  </DialogDescription>
                </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FamilyMemberPatientCombobox
                    control={form.control}
                    name="familyMemberDocumentNumber"
                    label="Paciente"
                    placeholder="Selecciona un paciente"
                    searchPlaceholder="Buscar por nombre o documento..."
                    emptyMessage="No se encontraron pacientes elegibles"
                    description="Se excluyen el titular y los familiares ya agregados."
                    disabled={assignMutation.isPending}
                    excludedPatientIds={excludedPatientIds}
                    required
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <LoadingButton
                      type="submit"
                      loading={assignMutation.isPending}
                      disabled={assignMutation.isPending}
                    >
                      Agregar familiar
                    </LoadingButton>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingMembers ? (
          <FamilyMembersSkeleton />
        ) : familyMembers && familyMembers.length > 0 ? (
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                onRemove={() => removeMutation.mutate(member.id)}
                isRemoving={removingId === member.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay familiares agregados a este plan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

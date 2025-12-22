import { z } from "zod";
import { PayerType, PlanSubscriptionStatus } from "~/types/plan-subscriptions";

export const planSubscriptionFormSchema = z
  .object({
    patientId: z.string().min(1, { message: "El paciente es requerido" }),
    planId: z.string().min(1, { message: "El plan es requerido" }),
    companyId: z.string().optional(),
    status: z.nativeEnum(PlanSubscriptionStatus).optional(),
    payerType: z.nativeEnum(PayerType, {
      message: "El tipo de pagador es requerido",
    }),
    startDate: z.string().min(1, { message: "La fecha de inicio es requerida" }),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.payerType === PayerType.COMPANY && !data.companyId) {
        return false;
      }
      return true;
    },
    {
      message: "La empresa es requerida cuando el pagador es una empresa",
      path: ["companyId"],
    }
  );

export type PlanSubscriptionFormSchema = z.infer<typeof planSubscriptionFormSchema>;

import { z } from "zod";
import { PlanType } from "~/types/plans";

const benefitsSchema = z.object({
  telemedicine: z.boolean(),
  medicationDelivery: z.boolean(),
  ambulanceTransfer: z.boolean(),
  homeCare: z.boolean(),
  workplaceCare: z.boolean(),
  emergencyRoom: z.boolean(),
  specializedConsultations: z.boolean(),
  labTests: z.boolean(),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional(),
});

export const planFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Máximo 1000 caracteres" })
    .optional(),
  planType: z.enum(PlanType),
  benefits: benefitsSchema,
  monthlyCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Debe ser un número decimal válido (ej: 123.45)" })
    .optional()
    .or(z.literal("")),
});

export type PlanFormSchema = z.infer<typeof planFormSchema>;

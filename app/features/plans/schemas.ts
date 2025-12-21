import { z } from "zod";
import { PlanType } from "~/types/plans";

const benefitsSchema = z.object({
  consultations: z.boolean(),
  emergencyCoverage: z.boolean(),
  dental: z.boolean(),
  optometry: z.boolean(),
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
    .number()
    .min(0, { message: "Debe ser mayor o igual a 0" })
    .optional(),
});

export type PlanFormSchema = z.infer<typeof planFormSchema>;

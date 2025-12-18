import { z } from "zod";
import { PlanType } from "~/types/plans";

const benefitsSchema = z.object({
  consultations: z
    .number()
    .int({ message: "El número de consultas debe ser entero" })
    .min(0, { message: "Debe ser mayor o igual a 0" })
    .optional(),
  emergencyCoverage: z.boolean(),
  dental: z.boolean(),
  ophthalmology: z.boolean().optional().default(false),
  optometria: z.boolean().optional().default(false),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional(),
});

export const planFormSchema = z
  .object({
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
    planType: z.nativeEnum(PlanType),
    minMembers: z
      .number()
      .int({ message: "Debe ser un número entero" })
      .min(1, { message: "Debe ser mayor o igual a 1" })
      .optional(),
    benefits: benefitsSchema,
    monthlyCost: z.number().min(0, { message: "Debe ser mayor o igual a 0" })
      .optional(),
    annualCost: z.number().min(0, { message: "Debe ser mayor o igual a 0" })
      .optional(),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.validFrom && data.validUntil) {
        return data.validUntil >= data.validFrom;
      }
      return true;
    },
    {
      message: "La fecha de finalización debe ser posterior a la inicial",
      path: ["validUntil"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.planType === PlanType.ENTERPRISE) {
      if (typeof data.minMembers !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minMembers"],
          message: "Ingresa el mínimo de miembros",
        });
      }
    }
  });

export type PlanFormSchema = z.infer<typeof planFormSchema>;

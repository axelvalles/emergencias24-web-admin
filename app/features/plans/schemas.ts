import { z } from "zod";
import {
  PlanBenefitValueType,
  PlanBillingPeriod,
  PlanType,
} from "~/types/plans";

const quantityBenefitSchema = z
  .object({
    benefitId: z.string().min(1, { message: "Selecciona un beneficio" }),
    valueType: z.literal(PlanBenefitValueType.QUANTITY),
    quantity: z.number().int().positive().optional(),
    isUnlimited: z.boolean(),
    discountPercentage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isUnlimited && typeof data.quantity !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Debes indicar una cantidad o marcarlo como ilimitado",
      });
    }
  });

const discountBenefitSchema = z.object({
  benefitId: z.string().min(1, { message: "Selecciona un beneficio" }),
  valueType: z.literal(PlanBenefitValueType.DISCOUNT),
  quantity: z.number().optional(),
  isUnlimited: z.boolean(),
  discountPercentage: z
    .string()
    .trim()
    .regex(/^(100|\d{1,2})(\.\d{1,2})?$/, {
      message: "Debe ser un porcentaje entre 0 y 100",
    }),
});

const planBenefitSchema = z.discriminatedUnion("valueType", [
  quantityBenefitSchema,
  discountBenefitSchema,
]);

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
    planType: z.enum(PlanType),
    billingPeriod: z.enum(PlanBillingPeriod),
    benefitsNotes: z
      .string()
      .trim()
      .max(500, { message: "Máximo 500 caracteres" })
      .optional(),
    planBenefits: z.array(planBenefitSchema),
    monthlyCost: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, {
        message: "Debe ser un número decimal válido (ej: 123.45)",
      })
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const benefitIds = data.planBenefits.map((planBenefit) => planBenefit.benefitId);
    const duplicatedBenefitIds = benefitIds.filter(
      (benefitId, index) => benefitIds.indexOf(benefitId) !== index
    );

    duplicatedBenefitIds.forEach((benefitId) => {
      const duplicatedIndex = benefitIds.findIndex((currentId) => currentId === benefitId);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["planBenefits", duplicatedIndex, "benefitId"],
        message: "No puedes repetir el mismo beneficio en el plan",
      });
    });
  });

export type PlanFormSchema = z.infer<typeof planFormSchema>;

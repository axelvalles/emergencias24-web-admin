import { z } from "zod";

export const benefitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" }),
});

export type BenefitFormSchema = z.infer<typeof benefitFormSchema>;

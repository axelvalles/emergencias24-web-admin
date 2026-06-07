import { z } from "zod";

export const ambulanceUnitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),
  memberIds: z.array(z.string()).optional(),
});

export type AmbulanceUnitFormSchema = z.infer<typeof ambulanceUnitFormSchema>;
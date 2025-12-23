import { z } from "zod";

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(255, { message: "Máximo 255 caracteres" }),
  taxId: z
    .string()
    .trim()
    .min(5, { message: "El NIT/Tax ID debe tener al menos 5 caracteres" })
    .max(50, { message: "Máximo 50 caracteres" }),
  contactEmail: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Máximo 255 caracteres" }),
  contactPhone: z
    .string()
    .trim()
    .min(7, { message: "El teléfono debe tener al menos 7 caracteres" })
    .max(20, { message: "Máximo 20 caracteres" }),
});

export type CompanyFormSchema = z.infer<typeof companyFormSchema>;

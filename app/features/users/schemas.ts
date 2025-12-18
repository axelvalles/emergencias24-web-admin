import { z } from "zod";
import { UserRole } from "~/types/users";

export const userFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "El apellido es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),
  phone: z
    .string()
    .trim()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .min(1, { message: "El correo es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),
  role: z.nativeEnum(UserRole, {
    error: "El rol es obligatorio",
  }),
  password: z
    .string()
    .trim()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type UserFormSchema = z.infer<typeof userFormSchema>;

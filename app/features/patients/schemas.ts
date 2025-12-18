import { z } from "zod";
import { DocumentType, Gender } from "~/types/patients";

export const patientFormSchema = z.object({
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
  birthDate: z.date().optional().nullable(),
  gender: z.nativeEnum(Gender, {
    error: "El género es obligatorio",
  }),
  documentType: z.nativeEnum(DocumentType, {
    error: "El tipo de documento es obligatorio",
  }),
  documentNumber: z
    .string()
    .trim()
    .min(1, { message: "El número de documento es obligatorio" })
    .max(50, { message: "Máximo 50 caracteres" }),
  address: z
    .string()
    .trim()
    .max(200, { message: "Máximo 200 caracteres" })
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .trim()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  zipCode: z
    .string()
    .trim()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  secondaryPhone: z
    .string()
    .trim()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  emergencyContactName: z
    .string()
    .trim()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional()
    .or(z.literal("")),
  allergies: z
    .string()
    .trim()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional()
    .or(z.literal("")),
  medicalConditions: z
    .string()
    .trim()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type PatientFormSchema = z.infer<typeof patientFormSchema>;

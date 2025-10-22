import { z } from "zod";

export const createPatientSchema = z.object({
  first_name: z
    .string({ error: "First name is required." })
    .min(1, { error: "First name must be at least 1 character." })
    .max(100, { error: "First name must be at most 100 characters." }),
  last_name: z
    .string({ error: "Last name is required." })
    .min(1, { error: "Last name must be at least 1 character." })
    .max(100, { error: "Last name must be at most 100 characters." }),
  birth_date: z
    .date({ error: "Birth date is required." })
    .optional(),
  gender: z
    .string({ error: "Gender is required." })
    .min(1, { error: "Gender must be at least 1 character." }),
  document_type: z
    .string({ error: "Document type is required." })
    .min(1, { error: "Document type must be at least 1 character." }),
  document_number: z
    .string({ error: "Document number is required." })
    .min(1, { error: "Document number must be at least 1 character." })
    .max(50, { error: "Document number must be at most 50 characters." }),
  address: z
    .string()
    .max(200, { error: "Address must be at most 200 characters." })
    .optional(),
  city: z
    .string()
    .max(100, { error: "City must be at most 100 characters." })
    .optional(),
  state: z
    .string()
    .max(100, { error: "State must be at most 100 characters." })
    .optional(),
  zip_code: z
    .string()
    .max(20, { error: "Zip code must be at most 20 characters." })
    .optional(),
  phone: z
    .string()
    .max(20, { error: "Phone must be at most 20 characters." })
    .optional(),
  secondary_phone: z
    .string()
    .max(20, { error: "Secondary phone must be at most 20 characters." })
    .optional(),
  emergency_contact_name: z
    .string()
    .max(100, { error: "Emergency contact name must be at most 100 characters." })
    .optional(),
  emergency_contact_phone: z
    .string()
    .max(20, { error: "Emergency contact phone must be at most 20 characters." })
    .optional(),
});

export type CreatePatientFormSchema = z.infer<typeof createPatientSchema>;
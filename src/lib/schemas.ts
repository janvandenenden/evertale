import { z } from "zod";

export const createChildSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim(),
  birth_year: z
    .number()
    .int()
    .min(2010, "Birth year must be 2010 or later")
    .max(new Date().getFullYear(), "Birth year cannot be in the future"),
});

export const photoUploadSchema = z.object({
  child_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
  file_size: z
    .number()
    .max(10 * 1024 * 1024, "File must be under 10MB"),
});

export const generateCharacterSchema = z.object({
  child_id: z.string().uuid(),
  photo_id: z.string().uuid(),
  story_id: z.string().uuid(),
});

export const createOrderSchema = z.object({
  character_version_id: z.string().uuid(),
  product_type: z.enum(["personalized_book", "founding_family_edition"]),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type GenerateCharacterInput = z.infer<typeof generateCharacterSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

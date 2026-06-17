import { z } from "zod";

export const EmailSchema = z
  .string()
  .email("Email invalide")
  .max(254, "Email trop long")
  .toLowerCase()
  .trim();

export const PasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe est trop long");

export const SubscribeSchema = z.object({
  email: EmailSchema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const BootstrapSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const ToggleSubscriberSchema = z.object({
  is_active: z.boolean(),
});

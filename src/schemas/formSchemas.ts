import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(60, "O nome deve ter no máximo 60 caracteres."),
  email: z.string().trim().email("Informe um email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const usernameSchema = z.object({
  username: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(60, "O nome deve ter no máximo 60 caracteres."),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: z.string().min(6, "A nova senha precisa ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(1, "Confirme sua nova senha."),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "A confirmação da senha não corresponde.",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UsernameFormValues = z.infer<typeof usernameSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

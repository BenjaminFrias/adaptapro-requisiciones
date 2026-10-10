import { z } from "zod";

export const loginSchema = z.object({
  usuario: z
    .string()
    .min(1, "El nombre de usuario o correo es obligatorio")
    .trim(),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirme la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

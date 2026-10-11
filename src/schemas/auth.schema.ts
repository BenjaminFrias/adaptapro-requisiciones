import { z } from 'zod';

export const loginSchema = z.object({
	usuario: z
		.string()
		.trim()
		.superRefine((trimmed, ctx) => {
			if (!trimmed) {
				ctx.addIssue({
					code: 'custom',
					message: 'El usuario o correo es obligatorio',
				});
				return;
			}
			if (trimmed.includes('@')) {
				const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
				if (!isEmail) {
					ctx.addIssue({
						code: 'custom',
						message: 'Ingresa un correo electrónico válido',
					});
				}
			} else if (trimmed.length < 3) {
				ctx.addIssue({
					code: 'custom',
					message: 'El nombre de usuario debe tener al menos 3 caracteres',
				});
			}
		}),
	password: z
		.string()
		.min(1, 'La contraseña es obligatoria')
		.refine((val) => val.trim().length > 0, {
			message: 'La contraseña no puede estar vacía ni contener solo espacios',
		})
		.refine((val) => val.length >= 8, {
			message: 'La contraseña debe tener al menos 8 caracteres',
		}),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
		newPassword: z
			.string()
			.min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
		confirmPassword: z.string().min(1, 'Confirme la nueva contraseña'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Las contraseñas nuevas no coinciden',
		path: ['confirmPassword'],
	});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

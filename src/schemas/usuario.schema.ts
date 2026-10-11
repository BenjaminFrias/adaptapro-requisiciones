import { z } from 'zod';

export const rolEnum = z.enum(
	['SOLICITANTE', 'APROBADOR', 'COMPRAS', 'ADMINISTRADOR'],
	{
		message: 'Seleccione un rol válido',
	},
);

export const crearUsuarioSchema = z.object({
	usuario: z
		.string()
		.trim()
		.min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
		.max(50, 'El nombre de usuario no puede exceder 50 caracteres')
		.regex(
			/^[a-zA-Z0-9._-]+$/,
			'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
		),
	nombre: z
		.string()
		.trim()
		.min(2, 'El nombre completo debe tener al menos 2 caracteres')
		.max(150, 'El nombre no puede exceder 150 caracteres'),
	correo: z
		.string()
		.trim()
		.email('Ingrese un correo electrónico válido')
		.max(150, 'El correo no puede exceder 150 caracteres'),
	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.max(100, 'La contraseña no puede exceder 100 caracteres'),
	rol: rolEnum,
	departamentoId: z
		.number({ message: 'Seleccione un departamento válido' })
		.int()
		.positive('Seleccione un departamento válido'),
	activo: z.boolean(),
});

export const editarUsuarioSchema = z.object({
	id: z.number().int().positive(),
	usuario: z
		.string()
		.trim()
		.min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
		.max(50, 'El nombre de usuario no puede exceder 50 caracteres')
		.regex(
			/^[a-zA-Z0-9._-]+$/,
			'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
		),
	nombre: z
		.string()
		.trim()
		.min(2, 'El nombre completo debe tener al menos 2 caracteres')
		.max(150, 'El nombre no puede exceder 150 caracteres'),
	correo: z
		.string()
		.trim()
		.email('Ingrese un correo electrónico válido')
		.max(150, 'El correo no puede exceder 150 caracteres'),
	password: z
		.string()
		.optional()
		.refine((val) => !val || val.length >= 8, {
			message: 'La nueva contraseña debe tener al menos 8 caracteres',
		}),
	rol: rolEnum,
	departamentoId: z
		.number({ message: 'Seleccione un departamento válido' })
		.int()
		.positive('Seleccione un departamento válido'),
	activo: z.boolean(),
});

export const usuarioFormSchema = z
	.object({
		id: z.number().optional(),
		usuario: z
			.string()
			.trim()
			.min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
			.max(50, 'El nombre de usuario no puede exceder 50 caracteres')
			.regex(
				/^[a-zA-Z0-9._-]+$/,
				'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
			),
		nombre: z
			.string()
			.trim()
			.min(2, 'El nombre completo debe tener al menos 2 caracteres')
			.max(150, 'El nombre no puede exceder 150 caracteres'),
		correo: z
			.string()
			.trim()
			.email('Ingrese un correo electrónico válido')
			.max(150, 'El correo no puede exceder 150 caracteres'),
		password: z.string().optional(),
		rol: rolEnum,
		departamentoId: z
			.number({ message: 'Seleccione un departamento válido' })
			.int()
			.positive('Seleccione un departamento válido'),
		activo: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (!data.id) {
			if (!data.password || data.password.length < 8) {
				ctx.addIssue({
					code: 'custom',
					message: 'La contraseña debe tener al menos 8 caracteres',
					path: ['password'],
				});
			}
		} else {
			if (
				data.password &&
				data.password.length > 0 &&
				data.password.length < 8
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'La nueva contraseña debe tener al menos 8 caracteres',
					path: ['password'],
				});
			}
		}
	});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;
export type UsuarioFormData = z.infer<typeof usuarioFormSchema>;

import { z } from 'zod';

export const departamentoSchema = z.object({
	id: z.number().optional(),
	nombre: z
		.string()
		.trim()
		.min(2, 'El nombre del departamento debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	activo: z.boolean(),
});

export const crearDepartamentoSchema = z.object({
	nombre: z
		.string()
		.trim()
		.min(2, 'El nombre del departamento debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	activo: z.boolean(),
});

export const editarDepartamentoSchema = z.object({
	id: z.number().int().positive(),
	nombre: z
		.string()
		.trim()
		.min(2, 'El nombre del departamento debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	activo: z.boolean(),
});

export type DepartamentoFormData = z.infer<typeof departamentoSchema>;
export type CrearDepartamentoInput = z.infer<typeof crearDepartamentoSchema>;
export type EditarDepartamentoInput = z.infer<typeof editarDepartamentoSchema>;

import { z } from "zod";

export const requisicionItemSchema = z.object({
  id: z.number().optional(),
  descripcion: z.string().min(1, "La descripción del artículo es requerida"),
  cantidad: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  unidad: z.string().min(1, "La unidad es requerida (ej. unid, kg, servicio)"),
  costoEstimado: z
    .number()
    .nonnegative("No puede ser negativo")
    .optional()
    .nullable(),
});

export const requisicionSchema = z.object({
  tipo: z.enum(["BIEN", "SERVICIO"]),
  prioridad: z.enum(["NORMAL", "URGENTE"]),
  fechaRequerida: z.string().min(1, "La fecha requerida es obligatoria"),
  justificacion: z
    .string()
    .min(5, "La justificación debe tener al menos 5 caracteres"),
  items: z
    .array(requisicionItemSchema)
    .min(1, "Debes agregar al menos un artículo o servicio"),
});

export type RequisicionItemInput = z.infer<typeof requisicionItemSchema>;
export type RequisicionInput = z.infer<typeof requisicionSchema>;

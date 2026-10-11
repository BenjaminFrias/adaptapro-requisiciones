import { z } from "zod";

export const atencionComprasSchema = z.object({
  proveedor: z.string().min(1, "El nombre del proveedor es obligatorio"),
  numeroOrdenCompra: z.string().min(1, "El número de orden de compra es obligatorio"),
  costoFinal: z.number().positive("El costo final debe ser mayor a 0"),
  fechaEntregaEstimada: z.string().optional().nullable(),
});

export type AtencionComprasInput = z.infer<typeof atencionComprasSchema>;

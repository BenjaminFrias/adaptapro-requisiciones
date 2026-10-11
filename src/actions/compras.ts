"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { atencionComprasSchema, AtencionComprasInput } from "@/schemas/compras.schema";
import { revalidatePath } from "next/cache";
import { crearNotificaciones } from "@/lib/notificaciones";

/**
 * Obtener requisiciones para la bandeja de Compras (Aprobadas y En Compra) (RF-16)
 */
export async function getRequisicionesParaCompras() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }

  if (session.user.rol !== "COMPRAS" && session.user.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  return await db.requisicion.findMany({
    where: {
      estado: {
        in: ["APROBADA", "EN_COMPRA", "ATENDIDA"],
      },
    },
    include: {
      items: true,
      departamento: true,
      solicitante: {
        select: { id: true, nombre: true, usuario: true },
      },
      historial: {
        include: {
          usuario: {
            select: { nombre: true, usuario: true, rol: true },
          },
        },
        orderBy: {
          fecha: "asc",
        },
      },
      comprasDatos: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

/**
 * Marcar requisición como "En compra" con datos del proveedor, orden y costo (RF-17)
 */
export async function registrarEnCompra(
  requisicionId: number,
  data: AtencionComprasInput
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  if (session.user.rol !== "COMPRAS" && session.user.rol !== "ADMINISTRADOR") {
    return { success: false, error: "No tienes permiso para atender compras" };
  }

  const parseResult = atencionComprasSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Datos inválidos",
    };
  }

  const validData = parseResult.data;
  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion) {
      return { success: false, error: "Requisición no encontrada" };
    }

    if (requisicion.estado !== "APROBADA" && requisicion.estado !== "EN_COMPRA") {
      return { success: false, error: "La requisición no está lista para ser procesada en compras" };
    }

    await db.$transaction(async (tx) => {
      // Upsert de datos de compra
      await tx.comprasDatos.upsert({
        where: { requisicionId },
        update: {
          proveedor: validData.proveedor,
          numeroOrdenCompra: validData.numeroOrdenCompra,
          costoFinal: validData.costoFinal,
          fechaEntregaEstimada: validData.fechaEntregaEstimada
            ? new Date(validData.fechaEntregaEstimada)
            : null,
        },
        create: {
          requisicionId,
          proveedor: validData.proveedor,
          numeroOrdenCompra: validData.numeroOrdenCompra,
          costoFinal: validData.costoFinal,
          fechaEntregaEstimada: validData.fechaEntregaEstimada
            ? new Date(validData.fechaEntregaEstimada)
            : null,
        },
      });

      // Actualizar estado a EN_COMPRA si estaba APROBADA
      if (requisicion.estado !== "EN_COMPRA") {
        await tx.requisicion.update({
          where: { id: requisicionId },
          data: { estado: "EN_COMPRA" },
        });

        await tx.historial.create({
          data: {
            requisicionId,
            estadoAnterior: "APROBADA",
            estadoNuevo: "EN_COMPRA",
            usuarioId: userId,
            comentario: `Marcada 'En compra' con orden ${validData.numeroOrdenCompra} - Proveedor: ${validData.proveedor}`,
          },
        });

        // Notificar al solicitante que su pedido está en proceso de compra
        await crearNotificaciones(tx, {
          usuarioIds: [requisicion.solicitanteId],
          requisicionId,
          mensaje: `Tu requisición ${requisicion.numero} está en compra (Orden: ${validData.numeroOrdenCompra}).`,
        });
      }
    });

    revalidatePath("/compras");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar en compra:", error);
    return { success: false, error: "Error al procesar la compra" };
  }
}

/**
 * Marcar requisición como "Atendida" cuando el pedido llega (RF-18)
 */
export async function marcarAtendida(requisicionId: number, comentario: string = "") {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  if (session.user.rol !== "COMPRAS" && session.user.rol !== "ADMINISTRADOR") {
    return { success: false, error: "No autorizado" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion || requisicion.estado !== "EN_COMPRA") {
      return { success: false, error: "La requisición debe estar 'En compra' para ser atendida" };
    }

    await db.$transaction(async (tx) => {
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: { estado: "ATENDIDA" },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: "EN_COMPRA",
          estadoNuevo: "ATENDIDA",
          usuarioId: userId,
          comentario: comentario ? `Atendida: ${comentario}` : "Bienes o servicios recibidos y entregados a satisfacción",
        },
      });

      // Notificar al solicitante que la requisición fue atendida
      await crearNotificaciones(tx, {
        usuarioIds: [requisicion.solicitanteId],
        requisicionId,
        mensaje: `Tu requisición ${requisicion.numero} ha sido atendida y completada.`,
      });
    });

    revalidatePath("/compras");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar atendida:", error);
    return { success: false, error: "Error al registrar la entrega" };
  }
}

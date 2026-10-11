"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtener requisiciones pendientes de aprobación para el departamento del aprobador (RF-12)
 */
export async function getRequisicionesPendientesAprobador() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }

  if (session.user.rol !== "APROBADOR" && session.user.rol !== "ADMINISTRADOR") {
    throw new Error("No autorizado");
  }

  const deptoId = session.user.departamentoId;

  return await db.requisicion.findMany({
    where: {
      departamentoId: deptoId,
      estado: "PENDIENTE_APROBACION",
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
      fechaEnvio: "desc",
    },
  });
}

/**
 * Aprobar requisición (RF-13, RF-15)
 * Nadie puede aprobar su propia requisición (RF-15)
 */
export async function aprobarRequisicion(requisicionId: number, comentario: string = "") {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  if (session.user.rol !== "APROBADOR" && session.user.rol !== "ADMINISTRADOR") {
    return { success: false, error: "No tienes permiso para aprobar requisiciones" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion) {
      return { success: false, error: "Requisición no encontrada" };
    }

    if (requisicion.estado !== "PENDIENTE_APROBACION") {
      return { success: false, error: "La requisición no está pendiente de aprobación" };
    }

    // Regla RF-15: Nadie puede aprobar su propia requisición
    if (requisicion.solicitanteId === userId) {
      return { success: false, error: "No puedes aprobar tu propia requisición" };
    }

    await db.$transaction(async (tx) => {
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: {
          estado: "APROBADA",
        },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: "PENDIENTE_APROBACION",
          estadoNuevo: "APROBADA",
          usuarioId: userId,
          comentario: comentario ? `Aprobada: ${comentario}` : "Requisición aprobada por el jefe de departamento",
        },
      });
    });

    revalidatePath("/aprobaciones");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al aprobar:", error);
    return { success: false, error: "Error al aprobar la requisición" };
  }
}

/**
 * Rechazar requisición (RF-13: motivo obligatorio)
 */
export async function rechazarRequisicion(requisicionId: number, motivo: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  if (session.user.rol !== "APROBADOR" && session.user.rol !== "ADMINISTRADOR") {
    return { success: false, error: "No autorizado" };
  }

  if (!motivo || motivo.trim().length < 5) {
    return { success: false, error: "El motivo del rechazo es obligatorio (mínimo 5 caracteres)" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion || requisicion.estado !== "PENDIENTE_APROBACION") {
      return { success: false, error: "Requisición no disponible para rechazo" };
    }

    if (requisicion.solicitanteId === userId) {
      return { success: false, error: "No puedes rechazar tu propia requisición" };
    }

    await db.$transaction(async (tx) => {
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: {
          estado: "RECHAZADA",
        },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: "PENDIENTE_APROBACION",
          estadoNuevo: "RECHAZADA",
          usuarioId: userId,
          comentario: `Rechazada. Motivo: ${motivo.trim()}`,
        },
      });
    });

    revalidatePath("/aprobaciones");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al rechazar:", error);
    return { success: false, error: "Error al rechazar la requisición" };
  }
}

/**
 * Devolver requisición para corrección (RF-13, RF-14: comentario obligatorio)
 */
export async function devolverRequisicion(requisicionId: number, comentario: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  if (session.user.rol !== "APROBADOR" && session.user.rol !== "ADMINISTRADOR") {
    return { success: false, error: "No autorizado" };
  }

  if (!comentario || comentario.trim().length < 5) {
    return { success: false, error: "El comentario de corrección es obligatorio (mínimo 5 caracteres)" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion || requisicion.estado !== "PENDIENTE_APROBACION") {
      return { success: false, error: "Requisición no disponible para devolución" };
    }

    if (requisicion.solicitanteId === userId) {
      return { success: false, error: "No puedes devolver tu propia requisición" };
    }

    await db.$transaction(async (tx) => {
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: {
          estado: "DEVUELTA",
        },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: "PENDIENTE_APROBACION",
          estadoNuevo: "DEVUELTA",
          usuarioId: userId,
          comentario: `Devuelta para corrección: ${comentario.trim()}`,
        },
      });
    });

    revalidatePath("/aprobaciones");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al devolver:", error);
    return { success: false, error: "Error al devolver la requisición" };
  }
}

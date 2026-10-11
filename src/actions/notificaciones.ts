"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene las notificaciones del usuario autenticado (últimas 20) y la cuenta de no leídas.
 */
export async function getMisNotificaciones() {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "No autenticado",
      notificaciones: [],
      totalNoLeidas: 0,
    };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const [notificaciones, totalNoLeidas] = await Promise.all([
      db.notificacion.findMany({
        where: { usuarioId: userId },
        orderBy: { fecha: "desc" },
        take: 20,
        include: {
          requisicion: {
            select: {
              id: true,
              numero: true,
              estado: true,
            },
          },
        },
      }),
      db.notificacion.count({
        where: {
          usuarioId: userId,
          leida: false,
        },
      }),
    ]);

    return {
      success: true,
      notificaciones: JSON.parse(JSON.stringify(notificaciones)),
      totalNoLeidas,
    };
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return {
      success: false,
      error: "Error al cargar notificaciones",
      notificaciones: [],
      totalNoLeidas: 0,
    };
  }
}

/**
 * Marca una notificación individual como leída.
 */
export async function marcarNotificacionLeida(notificacionId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    await db.notificacion.updateMany({
      where: {
        id: notificacionId,
        usuarioId: userId,
      },
      data: {
        leida: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return { success: false, error: "Error al actualizar notificación" };
  }
}

/**
 * Marca todas las notificaciones del usuario como leídas.
 */
export async function marcarTodasNotificacionesLeidas() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    await db.notificacion.updateMany({
      where: {
        usuarioId: userId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error);
    return { success: false, error: "Error al actualizar notificaciones" };
  }
}

/**
 * Obtiene los detalles completos de una requisición para abrir el modal desde cualquier vista.
 */
export async function getRequisicionParaModal(requisicionId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado", requisicion: null };
  }

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
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
    });

    if (!requisicion) {
      return { success: false, error: "Requisición no encontrada", requisicion: null };
    }

    return {
      success: true,
      requisicion: JSON.parse(JSON.stringify(requisicion)),
    };
  } catch (error) {
    console.error("Error al obtener detalle de requisición:", error);
    return { success: false, error: "Error al cargar requisición", requisicion: null };
  }
}

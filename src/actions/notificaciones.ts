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

    const userId = parseInt(session.user.id, 10);
    const userRole = session.user.rol;
    const userDeptoId = session.user.departamentoId;

    // Validación de permisos de acceso (RBAC + Propiedad):
    // 1. El solicitante dueño de la requisición
    // 2. Aprobador del departamento correspondiente
    // 3. Compras (para requisiciones aprobadas o en trámite)
    // 4. Administrador del sistema
    const isOwner = requisicion.solicitanteId === userId;
    const isApproverOfDepto =
      (userRole === "APROBADOR" || userRole === "ADMINISTRADOR") &&
      requisicion.departamentoId === userDeptoId;
    const isCompras =
      userRole === "COMPRAS" &&
      ["APROBADA", "EN_COMPRA", "ATENDIDA"].includes(requisicion.estado);
    const isAdmin = userRole === "ADMINISTRADOR";

    if (!isOwner && !isApproverOfDepto && !isCompras && !isAdmin) {
      return {
        success: false,
        error: "No tienes permiso para ver esta requisición",
        requisicion: null,
      };
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

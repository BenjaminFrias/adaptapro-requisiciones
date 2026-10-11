import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface NotificarParams {
  usuarioIds: number[];
  requisicionId?: number | null;
  mensaje: string;
}

/**
 * Crea notificaciones en la base de datos de forma atómica o independiente.
 * Trunca el mensaje a 250 caracteres para asegurar consistencia con el esquema DB.
 */
export async function crearNotificaciones(
  tx: Prisma.TransactionClient | typeof db,
  { usuarioIds, requisicionId, mensaje }: NotificarParams
) {
  const safeMensaje =
    mensaje.length > 250 ? mensaje.slice(0, 247).trim() + "..." : mensaje.trim();

  // Eliminar duplicados y valores inválidos
  const uniqueIds = Array.from(new Set(usuarioIds)).filter((id) => id > 0);
  if (uniqueIds.length === 0) return;

  await tx.notificacion.createMany({
    data: uniqueIds.map((usuarioId) => ({
      usuarioId,
      requisicionId: requisicionId ?? null,
      mensaje: safeMensaje,
      leida: false,
    })),
  });
}

/**
 * Obtiene los IDs de los aprobadores activos de un departamento dado,
 * excluyendo opcionalmente al usuario actual para evitar auto-notificaciones.
 */
export async function getAprobadoresDepartamento(
  tx: Prisma.TransactionClient | typeof db,
  departamentoId: number,
  excludeUserId?: number
): Promise<number[]> {
  const aprobadores = await tx.usuario.findMany({
    where: {
      departamentoId,
      rol: "APROBADOR",
      activo: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  return aprobadores.map((u) => u.id);
}

/**
 * Obtiene los IDs de todos los usuarios activos del rol COMPRAS,
 * excluyendo opcionalmente al usuario actual.
 */
export async function getUsuariosCompras(
  tx: Prisma.TransactionClient | typeof db,
  excludeUserId?: number
): Promise<number[]> {
  const usuariosCompras = await tx.usuario.findMany({
    where: {
      rol: "COMPRAS",
      activo: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  return usuariosCompras.map((u) => u.id);
}

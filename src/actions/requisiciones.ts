"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requisicionSchema, RequisicionInput } from "@/schemas/requisicion.schema";
import { revalidatePath } from "next/cache";
import type { EstadoRequisicion, Prisma } from "@prisma/client";
import {
  crearNotificaciones,
  getAprobadoresDepartamento,
} from "@/lib/notificaciones";

/**
 * Genera el siguiente número correlativo atómico en formato REQ-YYYY-NNNN
 * usando la tabla correlativos_anuales de forma segura.
 */
async function generarSiguienteCorrelativo(): Promise<string> {
  const anioActual = new Date().getFullYear();

  return await db.$transaction(async (tx) => {
    // Upsert atómico del contador anual
    const correlativo = await tx.correlativoAnual.upsert({
      where: { anio: anioActual },
      update: { ultimo: { increment: 1 } },
      create: { anio: anioActual, ultimo: 1 },
    });

    const correlativoFormateado = String(correlativo.ultimo).padStart(4, "0");
    return `REQ-${anioActual}-${correlativoFormateado}`;
  });
}

/**
 * Obtener lista de requisiciones del usuario autenticado (o de su departamento / todas según rol)
 */
export async function getMisRequisiciones() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }

  const userId = parseInt(session.user.id, 10);

  // Por requerimiento básico del solicitante: obtiene sus requisiciones
  return await db.requisicion.findMany({
    where: {
      solicitanteId: userId,
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
      createdAt: "desc",
    },
  });
}

/**
 * Crear requisición (Borrador o Enviada directamente a Aprobación)
 */
export async function crearRequisicion(
  data: RequisicionInput,
  enviarDirectamente: boolean = false
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parseResult = requisicionSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Datos inválidos",
    };
  }

  const validData = parseResult.data;
  const userId = parseInt(session.user.id, 10);
  const deptoId = session.user.departamentoId;

  try {
    const nuevaRequisicion = await db.$transaction(async (tx) => {
      let numero: string | null = null;
      let estado: EstadoRequisicion = "BORRADOR";
      let fechaEnvio: Date | null = null;

      if (enviarDirectamente) {
        numero = await generarSiguienteCorrelativo();
        estado = "PENDIENTE_APROBACION";
        fechaEnvio = new Date();
      }

      const req = await tx.requisicion.create({
        data: {
          numero,
          solicitanteId: userId,
          departamentoId: deptoId,
          tipo: validData.tipo,
          prioridad: validData.prioridad,
          fechaRequerida: new Date(validData.fechaRequerida),
          justificacion: validData.justificacion,
          estado,
          fechaEnvio,
          items: {
            create: validData.items.map((item) => ({
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              unidad: item.unidad,
              costoEstimado: item.costoEstimado ? item.costoEstimado : null,
            })),
          },
        },
      });

      // Registrar historial inicial
      await tx.historial.create({
        data: {
          requisicionId: req.id,
          estadoAnterior: null,
          estadoNuevo: estado,
          usuarioId: userId,
          comentario: enviarDirectamente
            ? "Requisición creada y enviada a aprobación"
            : "Requisición guardada como borrador",
        },
      });

      // Notificar a los aprobadores del departamento si se envía a aprobación
      if (enviarDirectamente) {
        const aprobadorIds = await getAprobadoresDepartamento(tx, deptoId, userId);
        await crearNotificaciones(tx, {
          usuarioIds: aprobadorIds,
          requisicionId: req.id,
          mensaje: `Nueva requisición ${req.numero} pendiente de tu aprobación.`,
        });
      }

      return req;
    });

    revalidatePath("/dashboard");
    return { success: true, requisicion: nuevaRequisicion };
  } catch (error: unknown) {
    console.error("Error al crear requisición:", error);
    return { success: false, error: "Error al registrar la requisición" };
  }
}

/**
 * Editar requisición existente (solo permitido en BORRADOR o DEVUELTA - RF-08, RF-14)
 */
export async function editarRequisicion(
  requisicionId: number,
  data: RequisicionInput,
  enviarDirectamente: boolean = false
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const parseResult = requisicionSchema.safeParse(data);
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

    if (requisicion.solicitanteId !== userId && session.user.rol !== "ADMINISTRADOR") {
      return { success: false, error: "No tienes permiso para editar esta requisición" };
    }

    if (requisicion.estado !== "BORRADOR" && requisicion.estado !== "DEVUELTA") {
      return {
        success: false,
        error: "Solo se pueden editar requisiciones en Borrador o Devueltas",
      };
    }

    await db.$transaction(async (tx) => {
      // 1. Eliminar partidas anteriores para recrear con los datos actualizados
      await tx.requisicionItem.deleteMany({
        where: { requisicionId },
      });

      // 2. Determinar si se envía a aprobación o se mantiene
      let nuevoEstado: EstadoRequisicion = requisicion.estado;
      let numero = requisicion.numero;
      let fechaEnvio = requisicion.fechaEnvio;

      if (enviarDirectamente) {
        nuevoEstado = "PENDIENTE_APROBACION";
        fechaEnvio = new Date();
        if (!numero) {
          numero = await generarSiguienteCorrelativo();
        }
      }

      // 3. Actualizar datos de la requisición y crear los nuevos ítems
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: {
          numero,
          tipo: validData.tipo,
          prioridad: validData.prioridad,
          fechaRequerida: new Date(validData.fechaRequerida),
          justificacion: validData.justificacion,
          estado: nuevoEstado,
          fechaEnvio,
          items: {
            create: validData.items.map((item) => ({
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              unidad: item.unidad,
              costoEstimado: item.costoEstimado ? item.costoEstimado : null,
            })),
          },
        },
      });

      // 4. Registrar en el historial si cambió de estado o si se editaron datos
      const comentarioHistorial = enviarDirectamente
        ? requisicion.estado === "DEVUELTA"
          ? "Correcciones aplicadas y reenviada a aprobación"
          : "Borrador editado y enviado a aprobación"
        : "Requisición modificada por el solicitante";

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: requisicion.estado,
          estadoNuevo: nuevoEstado,
          usuarioId: userId,
          comentario: comentarioHistorial,
        },
      });

      // Si se envía a aprobación, notificar a los aprobadores del departamento
      if (enviarDirectamente) {
        const aprobadorIds = await getAprobadoresDepartamento(
          tx,
          requisicion.departamentoId,
          userId
        );
        await crearNotificaciones(tx, {
          usuarioIds: aprobadorIds,
          requisicionId,
          mensaje:
            requisicion.estado === "DEVUELTA"
              ? `Requisición ${numero} corregida y reenviada para aprobación.`
              : `Requisición ${numero} enviada para aprobación.`,
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/aprobaciones");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al editar requisición:", error);
    return { success: false, error: "Error al actualizar la requisición" };
  }
}

/**
 * Enviar requisición que estaba en BORRADOR a Aprobación (RF-09)
 */
export async function enviarRequisicion(requisicionId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
      include: { items: true },
    });

    if (!requisicion) {
      return { success: false, error: "Requisición no encontrada" };
    }

    if (requisicion.solicitanteId !== userId) {
      return { success: false, error: "No tienes permiso sobre esta requisición" };
    }

    if (requisicion.estado !== "BORRADOR" && requisicion.estado !== "DEVUELTA") {
      return {
        success: false,
        error: "Solo se pueden enviar requisiciones en borrador o devueltas",
      };
    }

    if (requisicion.items.length === 0) {
      return {
        success: false,
        error: "La requisición debe tener al menos un artículo",
      };
    }

    await db.$transaction(async (tx) => {
      // Si aún no tiene número, se genera correlativo
      let numero = requisicion.numero;
      if (!numero) {
        numero = await generarSiguienteCorrelativo();
      }

      await tx.requisicion.update({
        where: { id: requisicionId },
        data: {
          numero,
          estado: "PENDIENTE_APROBACION",
          fechaEnvio: new Date(),
        },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: requisicion.estado,
          estadoNuevo: "PENDIENTE_APROBACION",
          usuarioId: userId,
          comentario: "Enviada a aprobación por el solicitante",
        },
      });

      // Notificar a los aprobadores del departamento
      const aprobadorIds = await getAprobadoresDepartamento(
        tx,
        requisicion.departamentoId,
        userId
      );
      await crearNotificaciones(tx, {
        usuarioIds: aprobadorIds,
        requisicionId,
        mensaje: `Nueva requisición ${numero} pendiente de tu aprobación.`,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al enviar requisición:", error);
    return { success: false, error: "Error al enviar la requisición" };
  }
}

/**
 * Cancelar requisición (RF-10)
 */
export async function cancelarRequisicion(requisicionId: number, motivo: string = "") {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const requisicion = await db.requisicion.findUnique({
      where: { id: requisicionId },
    });

    if (!requisicion) {
      return { success: false, error: "Requisición no encontrada" };
    }

    if (requisicion.solicitanteId !== userId && session.user.rol !== "ADMINISTRADOR") {
      return { success: false, error: "No tienes permiso para cancelar esta requisición" };
    }

    if (
      requisicion.estado === "APROBADA" ||
      requisicion.estado === "EN_COMPRA" ||
      requisicion.estado === "ATENDIDA" ||
      requisicion.estado === "RECHAZADA" ||
      requisicion.estado === "CANCELADA"
    ) {
      return {
        success: false,
        error: "No se puede cancelar una requisición que ha sido rechazada, aprobada o finalizada",
      };
    }

    await db.$transaction(async (tx) => {
      await tx.requisicion.update({
        where: { id: requisicionId },
        data: { estado: "CANCELADA" },
      });

      await tx.historial.create({
        data: {
          requisicionId,
          estadoAnterior: requisicion.estado,
          estadoNuevo: "CANCELADA",
          usuarioId: userId,
          comentario: motivo ? `Cancelada por el usuario: ${motivo}` : "Cancelada por el solicitante",
        },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al cancelar requisición:", error);
    return { success: false, error: "Error al cancelar la requisición" };
  }
}

/**
 * Búsqueda rápida de requisiciones para el Command Palette / Barra de búsqueda de la cabecera.
 * Respeta permisos según rol (RBAC):
 * - ADMINISTRADOR: Busca en todas las requisiciones.
 * - APROBADOR: Busca en sus requisiciones y las de su departamento.
 * - COMPRAS: Busca en sus requisiciones y en las que estén en APROBADA, EN_COMPRA, ATENDIDA.
 * - SOLICITANTE: Busca en sus requisiciones.
 */
export async function buscarRequisicionesRapidas(query: string = "") {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado", requisiciones: [] };
  }

  const userId = parseInt(session.user.id, 10);
  const userRole = session.user.rol;
  const userDeptoId = session.user.departamentoId;

  // Filtro de permisos por RBAC
  let permissionWhere: Prisma.RequisicionWhereInput = {};

  if (userRole === "ADMINISTRADOR") {
    permissionWhere = {};
  } else if (userRole === "APROBADOR") {
    permissionWhere = {
      OR: [
        { solicitanteId: userId },
        { departamentoId: userDeptoId },
      ],
    };
  } else if (userRole === "COMPRAS") {
    permissionWhere = {
      OR: [
        { solicitanteId: userId },
        { estado: { in: ["APROBADA", "EN_COMPRA", "ATENDIDA"] } },
      ],
    };
  } else {
    // SOLICITANTE
    permissionWhere = {
      solicitanteId: userId,
    };
  }

  const cleanQuery = query.trim();

  const searchWhere: Prisma.RequisicionWhereInput = cleanQuery
    ? {
        OR: [
          { numero: { contains: cleanQuery, mode: "insensitive" } },
          { justificacion: { contains: cleanQuery, mode: "insensitive" } },
          {
            items: {
              some: {
                descripcion: { contains: cleanQuery, mode: "insensitive" },
              },
            },
          },
          {
            departamento: {
              nombre: { contains: cleanQuery, mode: "insensitive" },
            },
          },
          {
            comprasDatos: {
              is: {
                proveedor: { contains: cleanQuery, mode: "insensitive" },
              },
            },
          },
        ],
      }
    : {};

  try {
    const requisiciones = await db.requisicion.findMany({
      where: {
        AND: [permissionWhere, searchWhere],
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
        createdAt: "desc",
      },
      take: 8,
    });

    return {
      success: true,
      requisiciones: JSON.parse(JSON.stringify(requisiciones)),
    };
  } catch (error) {
    console.error("Error al buscar requisiciones rápidas:", error);
    return { success: false, error: "Error al buscar requisiciones", requisiciones: [] };
  }
}


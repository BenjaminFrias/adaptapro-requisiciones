"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Obtener todas las requisiciones y estadísticas globales para el módulo de Administración
 */
export async function getAdminDashboardData() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }

  if (session.user.rol !== "ADMINISTRADOR") {
    throw new Error("Acceso restringido para Administradores");
  }

  // 1. Obtener todas las requisiciones
  const requisiciones = await db.requisicion.findMany({
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

  // 2. Conteo de usuarios y departamentos
  const [totalUsuarios, totalDepartamentos] = await Promise.all([
    db.usuario.count({ where: { activo: true } }),
    db.departamento.count({ where: { activo: true } }),
  ]);

  // 3. Monto total en compras atendidas / en compra
  const totalMontoCompras = await db.comprasDatos.aggregate({
    _sum: {
      costoFinal: true,
    },
  });

  return {
    requisiciones,
    metricas: {
      totalRequisiciones: requisiciones.length,
      totalUsuarios,
      totalDepartamentos,
      totalMontoCompras: Number(totalMontoCompras._sum.costoFinal || 0),
    },
  };
}

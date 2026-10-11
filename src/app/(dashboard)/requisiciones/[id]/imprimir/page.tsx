import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrintView } from "@/components/requisiciones/PrintView";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RequisicionImprimirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const requisicionId = parseInt(resolvedParams.id, 10);

  if (isNaN(requisicionId)) {
    notFound();
  }

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
        orderBy: { fecha: "asc" },
      },
      comprasDatos: true,
    },
  });

  if (!requisicion) {
    notFound();
  }

  // Verificar permisos: solicitante, aprobador de depto, compras o admin
  const user = session.user;
  const esSolicitante = requisicion.solicitanteId === parseInt(user.id, 10);
  const esAprobadorDepto = user.rol === "APROBADOR" && requisicion.departamentoId === user.departamentoId;
  const esComprasOAdmin = user.rol === "COMPRAS" || user.rol === "ADMINISTRADOR";

  if (!esSolicitante && !esAprobadorDepto && !esComprasOAdmin) {
    redirect("/dashboard");
  }

  return <PrintView requisicion={JSON.parse(JSON.stringify(requisicion))} />;
}

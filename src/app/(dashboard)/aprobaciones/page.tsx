import { auth } from "@/lib/auth";
import { getRequisicionesPendientesAprobador } from "@/actions/aprobaciones";
import { AprobacionesClient } from "@/components/aprobaciones/AprobacionesClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AprobacionesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rol !== "APROBADOR" && session.user.rol !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  const requisiciones = await getRequisicionesPendientesAprobador();

  return (
    <AprobacionesClient
      user={{
        id: String(session.user.id),
        nombre: session.user.nombre,
        usuario: session.user.usuario,
        rol: session.user.rol,
        departamentoNombre: session.user.departamentoNombre,
      }}
      requisiciones={JSON.parse(JSON.stringify(requisiciones))}
    />
  );
}

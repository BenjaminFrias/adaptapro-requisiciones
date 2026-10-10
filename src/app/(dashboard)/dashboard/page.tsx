import { auth } from "@/lib/auth";
import { getMisRequisiciones } from "@/actions/requisiciones";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Obtener las requisiciones del usuario desde el servidor
  const requisiciones = await getMisRequisiciones();

  return (
    <DashboardClient
      user={{
        nombre: session.user.nombre,
        usuario: session.user.usuario,
        rol: session.user.rol,
        departamentoNombre: session.user.departamentoNombre,
      }}
      requisiciones={JSON.parse(JSON.stringify(requisiciones))}
    />
  );
}

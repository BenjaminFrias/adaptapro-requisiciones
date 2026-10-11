import { auth } from "@/lib/auth";
import { getAdminDashboardData } from "@/actions/admin";
import { AdminClient } from "@/components/admin/AdminClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rol !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();

  return (
    <AdminClient
      user={{
        nombre: session.user.nombre,
        usuario: session.user.usuario,
        rol: session.user.rol,
        departamentoNombre: session.user.departamentoNombre,
      }}
      data={JSON.parse(JSON.stringify(data))}
    />
  );
}

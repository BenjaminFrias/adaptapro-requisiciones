import { auth } from "@/lib/auth";
import { getRequisicionesParaCompras } from "@/actions/compras";
import { ComprasClient } from "@/components/compras/ComprasClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rol !== "COMPRAS" && session.user.rol !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  const requisiciones = await getRequisicionesParaCompras();

  return (
    <ComprasClient
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

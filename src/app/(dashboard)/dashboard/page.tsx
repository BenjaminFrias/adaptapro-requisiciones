import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, User, Building, Shield } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Panel de Requisiciones
            </h1>
            <p className="text-sm text-slate-500">
              Bienvenido al sistema interno de gestión de pedidos
            </p>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit" className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </header>

        {/* Tarjeta de Información de Sesión y Rol */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Sesión Activa</CardTitle>
            <CardDescription>
              Información de tu cuenta y permisos asignados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
              <User className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Usuario / Nombre</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {session?.user?.nombre}
                </p>
                <p className="text-xs text-slate-400">@{session?.user?.usuario}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
              <Building className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Departamento</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {session?.user?.departamentoNombre || "Sin departamento"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
              <Shield className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Rol Asignado</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {session?.user?.rol}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menú de acceso según Rol */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:border-blue-400 transition-colors">
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Mis Requisiciones</CardTitle>
              <CardDescription className="text-xs">
                Ver o crear requisiciones personales
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link href="/requisiciones" className="text-xs font-medium text-blue-600 hover:underline">
                Acceder &rarr;
              </Link>
            </CardContent>
          </Card>

          {session?.user?.rol === "APROBADOR" && (
            <Card className="border-amber-200 dark:border-amber-900/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Bandeja de Aprobaciones</CardTitle>
                <CardDescription className="text-xs">
                  Revisar requisiciones de tu departamento
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href="/aprobaciones" className="text-xs font-medium text-amber-600 hover:underline">
                  Ver pendientes &rarr;
                </Link>
              </CardContent>
            </Card>
          )}

          {session?.user?.rol === "COMPRAS" && (
            <Card className="border-emerald-200 dark:border-emerald-900/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Bandeja de Compras</CardTitle>
                <CardDescription className="text-xs">
                  Procesar requisiciones aprobadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href="/compras" className="text-xs font-medium text-emerald-600 hover:underline">
                  Atender pedidos &rarr;
                </Link>
              </CardContent>
            </Card>
          )}

          {session?.user?.rol === "ADMINISTRADOR" && (
            <Card className="border-purple-200 dark:border-purple-900/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Administración</CardTitle>
                <CardDescription className="text-xs">
                  Gestión de usuarios y departamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Link href="/admin/usuarios" className="text-xs font-medium text-purple-600 hover:underline">
                  Gestionar sistema &rarr;
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

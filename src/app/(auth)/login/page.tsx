"use client";

import { useState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, UserCheck, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("usuario", usuario);
      formData.append("password", password);

      const res = await loginAction(formData);
      if (res && !res.success) {
        setError(res.error || "Ocurrió un error al ingresar");
      }
    } catch {
      // Next.js redirection trigger en Server Action
    } finally {
      setLoading(false);
    }
  };

  const fillQuickUser = (user: string) => {
    setUsuario(user);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-vh-100 flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AdaptaPro ERP
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sistema Web de Requisiciones Internas
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tus solicitudes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario o Correo</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="ej. solicitante o tu@correo.com"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Ingresar al Sistema
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t bg-slate-50/50 p-4 dark:bg-slate-900/50 rounded-b-xl gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" /> Acceso Rápido de Prueba (Demo)
            </span>
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillQuickUser("solicitante")}
              >
                Solicitante
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillQuickUser("aprobador")}
              >
                Aprobador
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillQuickUser("compras")}
              >
                Compras
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => fillQuickUser("admin")}
              >
                Administrador
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-1">
              Clave predeterminada para todos: <code className="font-mono">password123</code>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

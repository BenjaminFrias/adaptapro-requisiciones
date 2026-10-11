"use client";

import { useState, useTransition } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { EstadoBadge } from "@/components/requisiciones/EstadoBadge";
import { Timeline } from "@/components/requisiciones/Timeline";
import {
  aprobarRequisicion,
  rechazarRequisicion,
  devolverRequisicion,
} from "@/actions/aprobaciones";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Calendar,
  Search,
  CheckSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { RequisicionConRelaciones } from "@/types/requisicion";
import { formatMontoBs } from "@/utils/currency";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/ui/pagination";

interface AprobacionesClientProps {
  user: {
    id: string;
    nombre: string;
    usuario: string;
    rol: string;
    departamentoNombre: string;
  };
  requisiciones: RequisicionConRelaciones[];
}

export function AprobacionesClient({ user, requisiciones }: AprobacionesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [selectedReq, setSelectedReq] = useState<RequisicionConRelaciones | null>(null);

  // Estados para modal de acción
  const [modalAction, setModalAction] = useState<"APROBAR" | "RECHAZAR" | "DEVOLVER" | null>(null);
  const [reqToAction, setReqToAction] = useState<RequisicionConRelaciones | null>(null);
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const pendientes = requisiciones.filter((req) => {
    return (
      (req.numero && req.numero.toLowerCase().includes(busqueda.toLowerCase())) ||
      req.justificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (req.solicitante?.nombre && req.solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );
  });

  // Paginación reactiva
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    startItem,
    endItem,
    canNext,
    canPrev,
    goToPage,
    setPageSize,
  } = usePagination({
    items: pendientes,
    initialPageSize: 15,
  });

  const handleOpenAction = (req: RequisicionConRelaciones, action: "APROBAR" | "RECHAZAR" | "DEVOLVER") => {
    setReqToAction(req);
    setModalAction(action);
    setComentarioAccion("");
    setErrorAccion(null);
  };

  const handleExecuteAction = () => {
    if (!reqToAction || !modalAction) return;

    setErrorAccion(null);
    startTransition(async () => {
      let res;
      if (modalAction === "APROBAR") {
        res = await aprobarRequisicion(reqToAction.id, comentarioAccion);
      } else if (modalAction === "RECHAZAR") {
        res = await rechazarRequisicion(reqToAction.id, comentarioAccion);
      } else if (modalAction === "DEVOLVER") {
        res = await devolverRequisicion(reqToAction.id, comentarioAccion);
      }

      if (res && !res.success) {
        setErrorAccion(res.error || "Ocurrió un error al procesar la acción");
      } else {
        setModalAction(null);
        setReqToAction(null);
        if (selectedReq?.id === reqToAction.id) {
          setSelectedReq(null);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#0e0e11] flex flex-col antialiased">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                Bandeja de Aprobaciones
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Requisiciones de {user.departamentoNombre}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Revisa, aprueba, rechaza o devuelve requerimientos solicitados por tu equipo.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por número o solicitante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9.5 h-10 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
            />
          </div>
        </div>

        {/* Tabla de Pendientes */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
                  Correlativo
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
                  Solicitante
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
                  Tipo / Prioridad
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
                  Justificación
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
                  Fecha Requerida
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 text-right pr-5">
                  Decisión
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-44 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        Bandeja al día
                      </p>
                      <p className="text-slate-400 text-xs">
                        No hay requisiciones pendientes de aprobación en tu departamento.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((req) => {
                  const esPropia = String(req.solicitanteId) === String(user.id);

                  return (
                    <TableRow key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800/70">
                      <TableCell className="py-3.5 pl-5">
                        <span className="font-mono font-bold text-xs text-[#301996] dark:text-[#6a9bcc] bg-[#301996]/5 dark:bg-[#301996]/20 px-2 py-1 rounded-md border border-[#301996]/15">
                          {req.numero || `ID #${req.id}`}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.solicitante?.nombre || "Usuario"}
                        </div>
                        {esPropia && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            (Tuya - No autoaprobable)
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {req.tipo === "BIEN" ? "Bien" : "Servicio"}
                          </span>
                          {req.prioridad === "URGENTE" && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded-full border border-red-200">
                              Urgente
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-normal">
                        {req.justificacion}
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(req.fechaRequerida).toLocaleDateString("es-VE", { timeZone: "UTC" })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900"
                            onClick={() => setSelectedReq(req)}
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {!esPropia ? (
                            <>
                              {/* Devolver */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAction(req, "DEVOLVER")}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-orange-700 bg-orange-50/70 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-300 gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Devolver
                              </Button>

                              {/* Rechazar */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAction(req, "RECHAZAR")}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50/70 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300 gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Rechazar
                              </Button>

                              {/* Aprobar */}
                              <Button
                                size="sm"
                                onClick={() => handleOpenAction(req, "APROBAR")}
                                className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Aprobar
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Requiere otro jefe
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Paginador */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            startItem={startItem}
            endItem={endItem}
            canNext={canNext}
            canPrev={canPrev}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Modal de Detalle */}
        <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
          <DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-2xl">
            <DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Requisición: {selectedReq?.numero}
                </DialogTitle>
                {selectedReq && <EstadoBadge estado={selectedReq.estado} />}
              </div>
            </DialogHeader>

            {selectedReq && (
              <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Justificación
                  </span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-700 dark:text-slate-300">
                    {selectedReq.justificacion}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Artículos Solicitados ({selectedReq.items?.length || 0})
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-zinc-800/60 text-[11px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2.5">Descripción</th>
                          <th className="p-2.5">Cant.</th>
                          <th className="p-2.5">Unidad</th>
                          <th className="p-2.5 text-right">Costo Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {selectedReq.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2.5 font-medium">{item.descripcion}</td>
                            <td className="p-2.5">{Number(item.cantidad)}</td>
                            <td className="p-2.5">{item.unidad}</td>
                            <td className="p-2.5 text-right font-mono">
                              {item.costoEstimado ? formatMontoBs(Number(item.costoEstimado), true) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Historial de la Requisición
                  </span>
                  <Timeline historial={selectedReq.historial} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Acción (Aprobar / Rechazar / Devolver) */}
        <Dialog open={!!modalAction} onOpenChange={(open) => !open && setModalAction(null)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#151518] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {modalAction === "APROBAR" && "Aprobar Requisición"}
                {modalAction === "RECHAZAR" && "Rechazar Requisición"}
                {modalAction === "DEVOLVER" && "Devolver para Corrección"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {modalAction === "APROBAR" && "Confirma que autorizas el pedido. Pasará a la bandeja de Compras."}
                {modalAction === "RECHAZAR" && "Indica el motivo por el cual no procede la requisición (obligatorio)."}
                {modalAction === "DEVOLVER" && "Describe qué debe corregir el solicitante para poder autorizarla (obligatorio)."}
              </p>

              {errorAccion && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorAccion}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {modalAction === "APROBAR" ? "Comentario de Aprobación (Opcional)" : "Motivo / Comentario Obligatorio *"}
                </label>
                <Textarea
                  placeholder="Escribe tu motivo o comentario aquí..."
                  rows={3}
                  value={comentarioAccion}
                  onChange={(e) => setComentarioAccion(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAction(null)}
                  disabled={isPending}
                  className="rounded-xl text-xs h-9"
                >
                  Cancelar
                </Button>

                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={handleExecuteAction}
                  className={`rounded-xl text-xs h-9 text-white font-semibold ${
                    modalAction === "APROBAR"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : modalAction === "RECHAZAR"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  Confirmar {modalAction === "APROBAR" ? "Aprobación" : modalAction === "RECHAZAR" ? "Rechazo" : "Devolución"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

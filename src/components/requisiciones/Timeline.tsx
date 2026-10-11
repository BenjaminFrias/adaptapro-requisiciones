import type { HistorialDetalle } from "@/types/requisicion";
import { EstadoBadge } from "./EstadoBadge";
import { Clock, User, MessageSquare } from "lucide-react";

interface TimelineProps {
  historial?: HistorialDetalle[];
}

export function Timeline({ historial }: TimelineProps) {
  if (!historial || historial.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        No hay registros de cambios en el historial.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
      {historial.map((item, index) => {
        const fechaFormateada = new Date(item.fecha).toLocaleString("es-VE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={item.id || index} className="relative group">
            {/* Nodo circular */}
            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-[#301996] shadow-xs" />

            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <EstadoBadge estado={item.estadoNuevo} />
                  {item.estadoAnterior && (
                    <span className="text-[10px] text-slate-400">
                      (desde {item.estadoAnterior})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{fechaFormateada}</span>
                </div>
              </div>

              {/* Responsable */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{item.usuario?.nombre || "Sistema"}</span>
                {item.usuario?.rol && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                    {item.usuario.rol}
                  </span>
                )}
              </div>

              {/* Comentario */}
              {item.comentario && (
                <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-normal">{item.comentario}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

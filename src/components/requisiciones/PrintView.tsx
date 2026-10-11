"use client";

import type { RequisicionConRelaciones } from "@/types/requisicion";
import { formatMontoBs } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Image from "next/image";

interface PrintViewProps {
  requisicion: RequisicionConRelaciones;
}

export function PrintView({ requisicion }: PrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalEstimado =
    requisicion.items?.reduce((acc, item) => {
      const c = Number(item.costoEstimado || 0);
      const q = Number(item.cantidad || 0);
      return acc + c * q;
    }, 0) || 0;

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-10 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-none">
      {/* Botón flotante para imprimir en pantalla (oculto al imprimir) */}
      <div className="flex justify-end mb-6 print:hidden">
        <Button
          onClick={handlePrint}
          className="bg-[#301996] hover:bg-[#25137a] text-white gap-2 text-xs rounded-xl shadow-md"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar como PDF
        </Button>
      </div>

      {/* Encabezado del Formato Oficial */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#035786] flex items-center justify-center p-2 text-white shrink-0">
              <Image
                src="/brand/logo-icono-white.svg"
                alt="AdaptaPro Ícono"
                width={28}
                height={20}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            <div>
              <Image
                src="/brand/logo-full-blue.svg"
                alt="AdaptaPro"
                width={130}
                height={30}
                className="h-6 w-auto object-contain"
                priority
              />
              <p className="text-xs text-slate-600 font-medium mt-1">
                Comprobante Oficial de Requisición de Bienes y Servicios
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono font-bold text-lg text-[#301996]">
              {requisicion.numero || `BORRADOR #${requisicion.id}`}
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Fecha Emisión: {requisicion.createdAt ? new Date(requisicion.createdAt).toLocaleDateString("es-VE") : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Datos Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/50 mb-6 text-xs">
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[10px] block">Solicitante</span>
          <span className="font-bold text-slate-800">{requisicion.solicitante?.nombre || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[10px] block">Departamento</span>
          <span className="font-bold text-slate-800">{requisicion.departamento?.nombre || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[10px] block">Tipo / Prioridad</span>
          <span className="font-bold text-slate-800">{requisicion.tipo} - {requisicion.prioridad}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[10px] block">Estado Actual</span>
          <span className="font-bold text-[#301996]">{requisicion.estado}</span>
        </div>
      </div>

      {/* Justificación */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Justificación del Requerimiento
        </h2>
        <div className="p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white leading-relaxed">
          {requisicion.justificacion}
        </div>
      </div>

      {/* Tabla de Artículos Solicitados */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Partidas / Artículos Solicitados
        </h2>
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700">
              <th className="p-2.5 border-r border-slate-300">#</th>
              <th className="p-2.5 border-r border-slate-300">Descripción del Bien o Servicio</th>
              <th className="p-2.5 border-r border-slate-300 text-center">Cantidad</th>
              <th className="p-2.5 border-r border-slate-300 text-center">Unidad</th>
              <th className="p-2.5 border-r border-slate-300 text-right">Costo Estimado</th>
              <th className="p-2.5 text-right">Subtotal Estimado</th>
            </tr>
          </thead>
          <tbody>
            {requisicion.items?.map((item, idx) => {
              const cost = Number(item.costoEstimado || 0);
              const qty = Number(item.cantidad || 0);
              const subtotal = cost * qty;

              return (
                <tr key={item.id || idx} className="border-b border-slate-200">
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                  <td className="p-2.5 border-r border-slate-300 font-medium">{item.descripcion}</td>
                  <td className="p-2.5 border-r border-slate-300 text-center">{qty}</td>
                  <td className="p-2.5 border-r border-slate-300 text-center">{item.unidad}</td>
                  <td className="p-2.5 border-r border-slate-300 text-right font-mono">
                    {cost > 0 ? formatMontoBs(cost, true) : "-"}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold">
                    {subtotal > 0 ? formatMontoBs(subtotal, true) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {totalEstimado > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={5} className="p-2.5 text-right border-r border-slate-300 uppercase">
                  Monto Total Estimado:
                </td>
                <td className="p-2.5 text-right font-mono text-[#301996]">
                  {formatMontoBs(totalEstimado, true)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Datos de Compras si aplica */}
      {requisicion.comprasDatos && (
        <div className="mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50/50 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Información de Compra Asignada
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Proveedor</span>
              <span className="font-bold">{requisicion.comprasDatos.proveedor}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Orden de Compra</span>
              <span className="font-mono font-bold">{requisicion.comprasDatos.numeroOrdenCompra}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Costo Final</span>
              <span className="font-mono font-bold text-slate-900">
                {formatMontoBs(Number(requisicion.comprasDatos.costoFinal), true)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Fecha de Entrega</span>
              <span>
                {requisicion.comprasDatos.fechaEntregaEstimada
                  ? new Date(requisicion.comprasDatos.fechaEntregaEstimada).toLocaleDateString("es-VE")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trazabilidad Resumida */}
      {requisicion.historial && requisicion.historial.length > 0 && (
        <div className="mb-10 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Historial de Estados Registrados
          </h2>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2">Fecha y Hora</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Comentario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requisicion.historial.map((h, i) => (
                  <tr key={h.id || i}>
                    <td className="p-2 font-mono text-[11px]">
                      {new Date(h.fecha).toLocaleString("es-VE")}
                    </td>
                    <td className="p-2 font-semibold text-[#301996]">{h.estadoNuevo}</td>
                    <td className="p-2">{h.usuario?.nombre || "Sistema"}</td>
                    <td className="p-2 text-slate-600">{h.comentario || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firmas de Autorización */}
      <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300 text-center text-xs">
        <div>
          <div className="border-b border-slate-400 mb-2 h-12" />
          <p className="font-bold text-slate-800">Solicitante</p>
          <p className="text-[11px] text-slate-500">{requisicion.solicitante?.nombre || ""}</p>
        </div>
        <div>
          <div className="border-b border-slate-400 mb-2 h-12" />
          <p className="font-bold text-slate-800">Jefe de Departamento</p>
          <p className="text-[11px] text-slate-500">Aprobación</p>
        </div>
        <div>
          <div className="border-b border-slate-400 mb-2 h-12" />
          <p className="font-bold text-slate-800">Área de Compras</p>
          <p className="text-[11px] text-slate-500">Recepción / Procesamiento</p>
        </div>
      </div>
    </div>
  );
}

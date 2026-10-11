import type { RequisicionConRelaciones } from "@/types/requisicion";

/**
 * Escapa valores para formato CSV
 */
function escapeCSV(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '""';
  const stringVal = String(valor).replace(/"/g, '""');
  return `"${stringVal}"`;
}

/**
 * Genera y descarga un archivo CSV en el navegador con la lista de requisiciones
 */
export function exportarRequisicionesCSV(
  requisiciones: RequisicionConRelaciones[],
  nombreArchivo: string = "requisiciones_adaptapro"
) {
  const encabezados = [
    "Correlativo",
    "Tipo",
    "Prioridad",
    "Estado",
    "Solicitante",
    "Departamento",
    "Fecha Solicitud",
    "Fecha Requerida",
    "Justificacion",
    "Cant. Items",
    "Proveedor OC",
    "Num Orden Compra",
    "Costo Final Bs",
  ];

  const filas = requisiciones.map((req) => {
    const fechaCreacion = req.createdAt
      ? new Date(req.createdAt).toLocaleDateString("es-VE")
      : "";
    const fechaRequerida = req.fechaRequerida
      ? new Date(req.fechaRequerida).toLocaleDateString("es-VE")
      : "";

    return [
      escapeCSV(req.numero || `Borrador #${req.id}`),
      escapeCSV(req.tipo),
      escapeCSV(req.prioridad),
      escapeCSV(req.estado),
      escapeCSV(req.solicitante?.nombre || "N/A"),
      escapeCSV(req.departamento?.nombre || "N/A"),
      escapeCSV(fechaCreacion),
      escapeCSV(fechaRequerida),
      escapeCSV(req.justificacion),
      escapeCSV(req.items?.length || 0),
      escapeCSV(req.comprasDatos?.proveedor || "N/A"),
      escapeCSV(req.comprasDatos?.numeroOrdenCompra || "N/A"),
      escapeCSV(req.comprasDatos?.costoFinal ? Number(req.comprasDatos.costoFinal) : ""),
    ].join(",");
  });

  // Agregar BOM (\uFEFF) para compatibilidad con Excel y acentos en español
  const contenidoCSV = "\uFEFF" + [encabezados.join(","), ...filas].join("\r\n");
  const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

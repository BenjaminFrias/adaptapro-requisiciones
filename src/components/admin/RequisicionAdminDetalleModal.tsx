'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Timeline } from '@/components/requisiciones/Timeline';
import { formatMontoBs } from '@/utils/currency';
import { Printer } from 'lucide-react';
import Link from 'next/link';
import type { RequisicionConRelaciones } from '@/types/requisicion';

interface RequisicionAdminDetalleModalProps {
	requisicion: RequisicionConRelaciones | null;
	open: boolean;
	onClose: () => void;
}

export function RequisicionAdminDetalleModal({
	requisicion,
	open,
	onClose,
}: RequisicionAdminDetalleModalProps) {
	if (!requisicion) return null;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold">
								Requisición:{' '}
								{requisicion.numero || `Borrador #${requisicion.id}`}
							</DialogTitle>
							<p className="text-xs text-slate-500 dark:text-zinc-400">
								Solicitante: {requisicion.solicitante?.nombre} (
								{requisicion.departamento?.nombre})
							</p>
						</div>
						<EstadoBadge estado={requisicion.estado} />
					</div>
				</DialogHeader>

				<div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
					{/* Justificación */}
					<div className="space-y-1">
						<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
							Justificación
						</span>
						<p className="p-3 rounded-md bg-slate-50 dark:bg-zinc-800 text-xs text-slate-700 dark:text-slate-300">
							{requisicion.justificacion}
						</p>
					</div>

					{/* Artículos Solicitados */}
					<div className="space-y-2">
						<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
							Artículos Solicitados
						</span>
						<div className="rounded-md border border-slate-200 dark:border-zinc-800 overflow-hidden">
							<table className="w-full text-left text-xs">
								<thead className="bg-slate-50 dark:bg-zinc-800 text-[11px] font-medium text-slate-500 uppercase">
									<tr>
										<th className="p-2.5">Descripción</th>
										<th className="p-2.5">Cant.</th>
										<th className="p-2.5">Unidad</th>
										<th className="p-2.5 text-right">Costo Est.</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
									{requisicion.items?.map((item) => (
										<tr key={item.id}>
											<td className="p-2.5 font-medium">{item.descripcion}</td>
											<td className="p-2.5">{Number(item.cantidad)}</td>
											<td className="p-2.5">{item.unidad}</td>
											<td className="p-2.5 text-right font-mono">
												{item.costoEstimado
													? formatMontoBs(Number(item.costoEstimado), true)
													: '-'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Datos de Compras si existen */}
					{requisicion.comprasDatos && (
						<div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-md border border-sky-200/60 dark:border-sky-900/40 text-xs space-y-1">
							<span className="font-semibold text-[#035786] dark:text-sky-400 uppercase text-[10px]">
								Datos de Compra
							</span>
							<p>
								<strong>Proveedor:</strong> {requisicion.comprasDatos.proveedor} |{' '}
								<strong>Orden:</strong>{' '}
								{requisicion.comprasDatos.numeroOrdenCompra}
							</p>
							<p>
								<strong>Costo Final:</strong>{' '}
								{formatMontoBs(
									Number(requisicion.comprasDatos.costoFinal),
									true,
								)}
							</p>
						</div>
					)}

					{/* Línea de Tiempo y Trazabilidad */}
					<div className="space-y-2 pt-2">
						<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
							Línea de Tiempo y Trazabilidad
						</span>
						<Timeline historial={requisicion.historial} />
					</div>

					<div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
						<Link
							href={`/requisiciones/${requisicion.id}/imprimir`}
							target="_blank"
							className="inline-flex items-center gap-1.5 text-xs font-medium text-[#035786] dark:text-sky-400 hover:underline"
						>
							<Printer className="w-3.5 h-3.5" />
							Abrir Comprobante Imprimible
						</Link>

						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="text-xs h-8.5 rounded-md"
						>
							Cerrar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

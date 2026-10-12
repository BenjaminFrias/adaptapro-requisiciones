'use client';

import Image from 'next/image';
import { EstadoBadge } from './EstadoBadge';
import { Timeline } from './Timeline';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Send, XCircle } from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { formatMontoBs } from '@/utils/currency';

interface RequisicionDetalleModalProps {
	requisicion: RequisicionConRelaciones | null;
	open: boolean;
	onClose: () => void;
	onEnviar?: (req: RequisicionConRelaciones) => void;
	onCancelar?: (req: RequisicionConRelaciones) => void;
	isPending?: boolean;
}

export function RequisicionDetalleModal({
	requisicion,
	open,
	onClose,
	onEnviar,
	onCancelar,
	isPending = false,
}: RequisicionDetalleModalProps) {
	if (!requisicion) return null;

	// Cálculo del costo total estimado en el modal de detalle
	const totalEstimadoModal =
		requisicion.items?.reduce((sum, item) => {
			const cost = Number(item.costoEstimado || 0);
			const qty = Number(item.cantidad || 0);
			return sum + cost * qty;
		}, 0) || 0;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-lg p-0 overflow-hidden shadow-2xl">
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200/80 dark:border-zinc-800">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-md bg-[#035786] flex items-center justify-center p-2 shadow-xs shrink-0">
								<Image
									src="/brand/logo-icono-white.svg"
									alt="AdaptaPro Ícono"
									width={26}
									height={20}
									className="w-full h-auto object-contain"
								/>
							</div>
							<div>
								<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
									<span>
										{requisicion.numero
											? requisicion.numero
											: `Borrador #${requisicion.id}`}
									</span>
								</DialogTitle>
								<p className="text-xs text-slate-400 dark:text-slate-500">
									Detalles y partidas presupuestarias
								</p>
							</div>
						</div>

						<EstadoBadge estado={requisicion.estado} />
					</div>
				</DialogHeader>

				<div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
					{/* Metadata en Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 dark:bg-zinc-900/60 rounded-md border border-slate-200/60 dark:border-zinc-800">
						<div>
							<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
								Tipo
							</span>
							<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
								{requisicion.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
							</span>
						</div>

						<div>
							<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
								Prioridad
							</span>
							<span
								className={`font-semibold text-xs ${
									requisicion.prioridad === 'URGENTE'
										? 'text-red-600 dark:text-red-400'
										: 'text-slate-800 dark:text-slate-200'
								}`}
							>
								{requisicion.prioridad === 'URGENTE' ? 'Urgente' : 'Normal'}
							</span>
						</div>

						<div>
							<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
								Fecha requerida
							</span>
							<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
								{new Date(requisicion.fechaRequerida).toLocaleDateString(
									'es-VE',
									{
										timeZone: 'UTC',
									},
								)}
							</span>
						</div>

						<div>
							<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
								Departamento
							</span>
							<span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
								{requisicion.departamento?.nombre || '-'}
							</span>
						</div>
					</div>

					{/* Justificación */}
					<div>
						<span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
							Justificación del requerimiento
						</span>
						<div className="p-3 rounded-md bg-slate-50/50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
							{requisicion.justificacion}
						</div>
					</div>

					{/* Lista de Artículos */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-700 dark:text-slate-300">
								Artículos solicitados ({requisicion.items?.length || 0})
							</span>
						</div>

						<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
							<table className="w-full text-left text-xs">
								<thead className="bg-slate-50 dark:bg-zinc-800/60 text-[11px] font-medium text-slate-500 border-b border-slate-200 dark:border-zinc-800">
									<tr>
										<th className="py-2.5 px-3">Descripción</th>
										<th className="py-2.5 px-3">Cantidad</th>
										<th className="py-2.5 px-3">Unidad</th>
										<th className="py-2.5 px-3 text-right">Costo Est.</th>
										<th className="py-2.5 px-3 text-right">Subtotal</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
									{requisicion.items?.map((item, idx) => {
										const cost = Number(item.costoEstimado || 0);
										const qty = Number(item.cantidad || 0);
										const subtotal = cost * qty;

										return (
											<tr
												key={item.id || idx}
												className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
											>
												<td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
													{item.descripcion}
												</td>
												<td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
													{qty}
												</td>
												<td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
													{item.unidad}
												</td>
												<td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 font-mono">
													{cost > 0 ? formatMontoBs(cost, true) : '-'}
												</td>
												<td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200 font-mono font-semibold">
													{subtotal > 0
														? formatMontoBs(subtotal, true)
														: '-'}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* Resumen Total Estimado */}
						{totalEstimadoModal > 0 && (
							<div className="flex justify-end pt-1">
								<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
									<span className="text-xs font-medium text-slate-500">
										Total estimado:
									</span>
									<span className="text-sm font-semibold font-mono text-[#035786] dark:text-sky-400 tabular-nums">
										{formatMontoBs(totalEstimadoModal, true)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* Datos de Compras si existen */}
					{requisicion.comprasDatos && (
						<div className="space-y-2 pt-1">
							<span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
								Datos de compra y proveedor
							</span>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-md border border-blue-200/60 dark:border-blue-900/40 text-xs">
								<div>
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
										Proveedor
									</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">
										{requisicion.comprasDatos.proveedor}
									</span>
								</div>
								<div>
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
										N° Orden compra
									</span>
									<span className="font-mono font-semibold text-[#035786] dark:text-sky-400">
										{requisicion.comprasDatos.numeroOrdenCompra}
									</span>
								</div>
								<div>
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
										Costo final
									</span>
									<span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
										{formatMontoBs(Number(requisicion.comprasDatos.costoFinal), true)}
									</span>
								</div>
								<div>
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
										Entrega estimada
									</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">
										{requisicion.comprasDatos.fechaEntregaEstimada
											? new Date(requisicion.comprasDatos.fechaEntregaEstimada).toLocaleDateString("es-VE", { timeZone: "UTC" })
											: "-"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Timeline de Historial */}
					<div className="space-y-2 pt-2">
						<span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
							Trazabilidad del pedido
						</span>
						<Timeline historial={requisicion.historial} />
					</div>

					{/* Pie con botones de acción y cierre */}
					<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
						<div>
							{requisicion.estado !== 'APROBADA' &&
								requisicion.estado !== 'EN_COMPRA' &&
								requisicion.estado !== 'ATENDIDA' &&
								requisicion.estado !== 'RECHAZADA' &&
								requisicion.estado !== 'CANCELADA' &&
								onCancelar && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										disabled={isPending}
										onClick={() => onCancelar(requisicion)}
										className="text-xs h-9 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full sm:w-auto"
									>
										<XCircle className="w-4 h-4 mr-1.5" />
										Cancelar Requisición
									</Button>
								)}
						</div>

						<div className="flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="text-xs h-9 rounded-md border-slate-200 dark:border-zinc-700"
							>
								Cerrar
							</Button>

							{(requisicion.estado === 'BORRADOR' ||
								requisicion.estado === 'DEVUELTA') &&
								onEnviar && (
									<Button
										type="button"
										size="sm"
										disabled={isPending}
										onClick={() => onEnviar(requisicion)}
										className="text-xs h-9 rounded-md font-medium"
									>
										<Send className="w-4 h-4 mr-1.5" />
										{requisicion.estado === 'DEVUELTA'
											? 'Reenviar a Aprobación'
											: 'Enviar a Aprobación'}
									</Button>
								)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

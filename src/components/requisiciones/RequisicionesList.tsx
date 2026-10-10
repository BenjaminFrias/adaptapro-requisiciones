'use client';

import { useState, useTransition } from 'react';
import { EstadoBadge } from './EstadoBadge';
import {
	enviarRequisicion,
	cancelarRequisicion,
} from '@/actions/requisiciones';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Search,
	Send,
	XCircle,
	Eye,
	Package,
	Calendar,
	Flame,
	X,
	Layers,
	Loader2,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';

interface RequisicionesListProps {
	requisiciones: RequisicionConRelaciones[];
}

export function RequisicionesList({ requisiciones }: RequisicionesListProps) {
	const [isPending, startTransition] = useTransition();
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Filtrado reactivo en cliente (búsqueda por número o justificación + filtro por estado)
	const requisicionesFiltradas = requisiciones.filter((req) => {
		const coincideTexto =
			(req.numero &&
				req.numero.toLowerCase().includes(busqueda.toLowerCase())) ||
			req.justificacion.toLowerCase().includes(busqueda.toLowerCase());

		const coincideEstado =
			filtroEstado === 'TODOS' || req.estado === filtroEstado;

		return coincideTexto && coincideEstado;
	});

	const handleEnviar = (id: number) => {
		if (confirm('¿Estás seguro de enviar esta requisición a aprobación?')) {
			startTransition(async () => {
				await enviarRequisicion(id);
			});
		}
	};

	const handleCancelar = (id: number) => {
		const motivo = prompt('Indica el motivo de la cancelación:');
		if (motivo !== null) {
			startTransition(async () => {
				await cancelarRequisicion(id, motivo);
			});
		}
	};

	// Cálculo del costo total estimado en el modal de detalle
	const totalEstimadoModal =
		selectedReq?.items?.reduce((sum, item) => {
			const cost = Number(item.costoEstimado || 0);
			const qty = Number(item.cantidad || 0);
			return sum + cost * qty;
		}, 0) || 0;

	return (
		<div className="space-y-4">
			{/* Barra de Filtros, Búsqueda y Selector de Estado */}
			<div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
				{/* Buscador */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<Input
						placeholder="Buscar por correlativo o justificación..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						className="pl-9.5 pr-8 h-10 text-xs sm:text-sm bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl focus-visible:ring-[#301996]/20 focus-visible:border-[#301996]"
					/>
					{busqueda && (
						<button
							type="button"
							onClick={() => setBusqueda('')}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
							aria-label="Limpiar búsqueda"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>

				{/* Filtros de Estado */}
				<div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto">
					<div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
						Mostrando{' '}
						<span className="font-bold text-slate-700 dark:text-slate-300">
							{requisicionesFiltradas.length}
						</span>{' '}
						de {requisiciones.length}
					</div>

					<Select
						value={filtroEstado}
						onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
					>
						<SelectTrigger className="h-10 min-w-44 text-xs font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl focus:ring-[#301996]/20">
							<SelectValue placeholder="Todos los estados" />
						</SelectTrigger>
						<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
							<SelectItem value="TODOS">Todos los estados</SelectItem>
							<SelectItem value="BORRADOR">Borrador</SelectItem>
							<SelectItem value="PENDIENTE_APROBACION">
								En Aprobación
							</SelectItem>
							<SelectItem value="APROBADA">Aprobada</SelectItem>
							<SelectItem value="DEVUELTA">Devuelta</SelectItem>
							<SelectItem value="EN_COMPRA">En Compra</SelectItem>
							<SelectItem value="ATENDIDA">Atendida</SelectItem>
							<SelectItem value="CANCELADA">Cancelada</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Tabla de Requisiciones */}
			<div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
				<Table>
					<TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
								Correlativo
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
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Artículos
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Estado
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 text-right pr-5">
								Acciones
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{requisicionesFiltradas.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-44 text-center text-xs text-slate-500"
								>
									<div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
										<div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
											<Package className="w-6 h-6 stroke-[1.5]" />
										</div>
										<p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
											No se encontraron requisiciones
										</p>
										<p className="text-slate-400 text-xs text-balance">
											{busqueda || filtroEstado !== 'TODOS'
												? 'Prueba modificando los filtros de búsqueda o el estado seleccionado.'
												: 'Aún no tienes solicitudes registradas. Crea una nueva usando el botón superior.'}
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							requisicionesFiltradas.map((req) => (
								<TableRow
									key={req.id}
									className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800/70"
								>
									{/* Correlativo */}
									<TableCell className="py-3.5 pl-5">
										{req.numero ? (
											<span className="font-mono font-bold text-xs text-[#301996] dark:text-[#6a9bcc] bg-[#301996]/5 dark:bg-[#301996]/20 px-2 py-1 rounded-md border border-[#301996]/15">
												{req.numero}
											</span>
										) : (
											<span className="text-slate-400 font-medium italic text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
												Borrador #{req.id}
											</span>
										)}
									</TableCell>

									{/* Tipo / Prioridad */}
									<TableCell className="py-3.5 text-xs">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="font-semibold text-slate-700 dark:text-slate-300">
												{req.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
											</span>
											{req.prioridad === 'URGENTE' && (
												<span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 px-1.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
													<Flame className="w-2.5 h-2.5" />
													Urgente
												</span>
											)}
										</div>
									</TableCell>

									{/* Justificación */}
									<TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-normal">
										<span title={req.justificacion}>{req.justificacion}</span>
									</TableCell>

									{/* Fecha Requerida */}
									<TableCell className="py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
										<div className="flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span>
												{new Date(req.fechaRequerida).toLocaleDateString(
													'es-VE',
													{
														timeZone: 'UTC',
													},
												)}
											</span>
										</div>
									</TableCell>

									{/* Cantidad de Items */}
									<TableCell className="py-3.5 text-xs">
										<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
											<Layers className="w-3 h-3 text-slate-400" />
											{req.items?.length || 0}{' '}
											{req.items?.length === 1 ? 'ítem' : 'ítems'}
										</span>
									</TableCell>

									{/* Estado Badge */}
									<TableCell className="py-3.5">
										<EstadoBadge estado={req.estado} />
									</TableCell>

									{/* Acciones */}
									<TableCell className="py-3.5 text-right pr-5">
										<div className="flex items-center justify-end gap-1.5">
											{/* Botón Ver Detalle */}
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-[#301996] hover:bg-[#301996]/10 dark:hover:text-purple-300 dark:hover:bg-[#301996]/20 transition-colors"
												onClick={() => setSelectedReq(req)}
												title="Ver Detalle Completo"
											>
												<Eye className="w-4 h-4" />
											</Button>

											{/* Botón Enviar a Aprobación (solo BORRADOR o DEVUELTA) */}
											{(req.estado === 'BORRADOR' ||
												req.estado === 'DEVUELTA') && (
												<Button
													variant="ghost"
													size="sm"
													disabled={isPending}
													className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
													onClick={() => handleEnviar(req.id)}
													title="Enviar a Aprobación"
												>
													{isPending ? (
														<Loader2 className="w-4 h-4 animate-spin" />
													) : (
														<Send className="w-4 h-4" />
													)}
												</Button>
											)}

											{/* Botón Cancelar (solo estados no finales) */}
											{req.estado !== 'APROBADA' &&
												req.estado !== 'EN_COMPRA' &&
												req.estado !== 'ATENDIDA' &&
												req.estado !== 'CANCELADA' && (
													<Button
														variant="ghost"
														size="sm"
														disabled={isPending}
														className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
														onClick={() => handleCancelar(req.id)}
														title="Cancelar Requisición"
													>
														<XCircle className="w-4 h-4" />
													</Button>
												)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Modal de Detalle Completo de la Requisición */}
			<Dialog
				open={!!selectedReq}
				onOpenChange={(open) => !open && setSelectedReq(null)}
			>
				<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-2xl">
					<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-200/80 dark:border-zinc-800">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div
									className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#301996]/20 shrink-0"
									style={{
										background:
											'linear-gradient(135deg, #301996 0%, #2563eb 100%)',
									}}
								>
									{/* Ícono de estrella */}
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-5 h-5 text-white"
										aria-hidden="true"
									>
										<g transform="translate(12, 12)">
											{[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
												<rect
													key={deg}
													x="-1.5"
													y="-9"
													width="3"
													height="6.8"
													rx="1.5"
													transform={`rotate(${deg})`}
												/>
											))}
											<circle cx="0" cy="0" r="2.2" />
										</g>
									</svg>
								</div>
								<div>
									<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
										<span>
											{selectedReq?.numero
												? selectedReq.numero
												: `Borrador #${selectedReq?.id}`}
										</span>
									</DialogTitle>
									<p className="text-xs text-slate-400 dark:text-slate-500">
										Detalles y partidas presupuestarias
									</p>
								</div>
							</div>

							{selectedReq && <EstadoBadge estado={selectedReq.estado} />}
						</div>
					</DialogHeader>

					{selectedReq && (
						<div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
							{/* Metadata en Grid */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 dark:bg-zinc-900/60 rounded-xl border border-slate-200/60 dark:border-zinc-800">
								<div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
										Tipo
									</span>
									<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
										{selectedReq.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
									</span>
								</div>

								<div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
										Prioridad
									</span>
									<span
										className={`font-semibold text-xs ${
											selectedReq.prioridad === 'URGENTE'
												? 'text-red-600 dark:text-red-400'
												: 'text-slate-800 dark:text-slate-200'
										}`}
									>
										{selectedReq.prioridad}
									</span>
								</div>

								<div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
										Fecha Requerida
									</span>
									<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
										{new Date(selectedReq.fechaRequerida).toLocaleDateString(
											'es-VE',
											{
												timeZone: 'UTC',
											},
										)}
									</span>
								</div>

								<div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
										Departamento
									</span>
									<span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
										{selectedReq.departamento?.nombre || '-'}
									</span>
								</div>
							</div>

							{/* Justificación */}
							<div>
								<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
									Justificación del Pedido
								</span>
								<div className="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
									{selectedReq.justificacion}
								</div>
							</div>

							{/* Lista de Artículos */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
										Artículos Solicitados ({selectedReq.items?.length || 0})
									</span>
								</div>

								<div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
									<table className="w-full text-left text-xs">
										<thead className="bg-slate-50 dark:bg-zinc-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
											<tr>
												<th className="py-2.5 px-3">Descripción</th>
												<th className="py-2.5 px-3">Cantidad</th>
												<th className="py-2.5 px-3">Unidad</th>
												<th className="py-2.5 px-3 text-right">Costo Est.</th>
												<th className="py-2.5 px-3 text-right">Subtotal</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
											{selectedReq.items?.map((item, idx) => {
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
															{cost > 0 ? `Bs. ${cost.toFixed(2)}` : '-'}
														</td>
														<td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200 font-mono font-semibold">
															{subtotal > 0
																? `Bs. ${subtotal.toFixed(2)}`
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
										<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
											<span className="text-[11px] font-semibold text-slate-500 uppercase">
												Total Estimado:
											</span>
											<span className="text-sm font-bold font-mono text-[#301996] dark:text-[#6a9bcc]">
												Bs. {totalEstimadoModal.toFixed(2)}
											</span>
										</div>
									</div>
								)}
							</div>

							{/* Pie con botón de cierre */}
							<div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-zinc-800">
								<Button
									type="button"
									variant="outline"
									onClick={() => setSelectedReq(null)}
									className="text-xs h-9 rounded-xl border-slate-200 dark:border-zinc-700"
								>
									Cerrar
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

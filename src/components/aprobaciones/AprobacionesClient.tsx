'use client';

import { useState, useTransition } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Timeline } from '@/components/requisiciones/Timeline';
import {
	aprobarRequisicion,
	rechazarRequisicion,
	devolverRequisicion,
} from '@/actions/aprobaciones';
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
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	CheckCircle,
	XCircle,
	RotateCcw,
	Eye,
	Calendar,
	Search,
	AlertCircle,
	Loader2,
	Package,
	X,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { formatMontoBs } from '@/utils/currency';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';

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

export function AprobacionesClient({
	user,
	requisiciones,
}: AprobacionesClientProps) {
	const [isPending, startTransition] = useTransition();
	const [busqueda, setBusqueda] = useState('');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Estados para modal de acción
	const [modalAction, setModalAction] = useState<
		'APROBAR' | 'RECHAZAR' | 'DEVOLVER' | null
	>(null);
	const [reqToAction, setReqToAction] =
		useState<RequisicionConRelaciones | null>(null);
	const [comentarioAccion, setComentarioAccion] = useState('');
	const [errorAccion, setErrorAccion] = useState<string | null>(null);

	const pendientes = requisiciones.filter((req) => {
		return (
			(req.numero &&
				req.numero.toLowerCase().includes(busqueda.toLowerCase())) ||
			req.justificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
			(req.solicitante?.nombre &&
				req.solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase()))
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

	const handleOpenAction = (
		req: RequisicionConRelaciones,
		action: 'APROBAR' | 'RECHAZAR' | 'DEVOLVER',
	) => {
		setReqToAction(req);
		setModalAction(action);
		setComentarioAccion('');
		setErrorAccion(null);
	};

	const handleExecuteAction = () => {
		if (!reqToAction || !modalAction) return;

		setErrorAccion(null);
		startTransition(async () => {
			let res;
			if (modalAction === 'APROBAR') {
				res = await aprobarRequisicion(reqToAction.id, comentarioAccion);
			} else if (modalAction === 'RECHAZAR') {
				res = await rechazarRequisicion(reqToAction.id, comentarioAccion);
			} else if (modalAction === 'DEVOLVER') {
				res = await devolverRequisicion(reqToAction.id, comentarioAccion);
			}

			if (res && !res.success) {
				setErrorAccion(res.error || 'Ocurrió un error al procesar la acción');
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
				{/* Encabezado Unificado */}
				<PageHeader
					title={`Requisiciones de ${user.departamentoNombre}`}
					description="Revisa, aprueba, rechaza o devuelve requerimientos solicitados por tu equipo."
				/>

				{/* Tabla de Pendientes con Cabecera Integrada */}
				<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
					{/* Cabecera integrada: Indicador de pendientes + Buscador compacto */}
					<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-slate-700 dark:text-slate-300">
								Pendientes de aprobación
							</span>
						</div>

						<div className="relative w-full md:w-64 shrink-0">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
							<Input
								placeholder="Buscar requisición o solicitante..."
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								className="h-8.5 pl-8 pr-7 text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus-visible:bg-white focus-visible:border-[#035786]"
							/>
							{busqueda && (
								<button
									type="button"
									onClick={() => setBusqueda('')}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
									aria-label="Limpiar búsqueda"
								>
									<X className="w-3 h-3" />
								</button>
							)}
						</div>
					</div>

					<Table>
						<TableHeader className="bg-slate-50/75 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
							<TableRow className="hover:bg-transparent">
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 pl-5">
									Correlativo
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Solicitante
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Tipo / prioridad
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Justificación
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Fecha requerida
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 text-right pr-5">
									Decisión
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{pendientes.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-44 text-center text-xs text-slate-500"
									>
										<div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
											<div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
												<Package className="w-5 h-5 stroke-[1.5]" />
											</div>
											<p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
												Bandeja al día
											</p>
											<p className="text-slate-400 text-xs text-balance">
												{busqueda
													? 'No se encontraron requisiciones que coincidan con la búsqueda.'
													: 'No hay requisiciones pendientes de aprobación en tu departamento.'}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								paginatedItems.map((req) => {
									const esPropia =
										String(req.solicitanteId) === String(user.id);

									return (
										<TableRow
											key={req.id}
											onClick={() => setSelectedReq(req)}
											className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group"
										>
											<TableCell className="py-3 pl-5">
												<span className="font-mono font-medium text-xs text-[#035786] dark:text-sky-400 bg-[#035786]/10 dark:bg-[#035786]/20 px-2 py-0.5 rounded-md border border-[#035786]/20">
													{req.numero || `ID #${req.id}`}
												</span>
											</TableCell>

											<TableCell className="py-3 text-xs">
												<div className="font-medium text-slate-900 dark:text-white">
													{req.solicitante?.nombre || 'Usuario'}
												</div>
												{esPropia && (
													<span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
														(Tuya - No autoaprobable)
													</span>
												)}
											</TableCell>

											<TableCell className="py-3 text-xs">
												<div className="flex items-center gap-1.5">
													<span className="text-slate-700 dark:text-slate-300">
														{req.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
													</span>
													{req.prioridad === 'URGENTE' && (
														<span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded-md border border-red-200/80">
															Urgente
														</span>
													)}
												</div>
											</TableCell>

											<TableCell className="py-3 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-normal">
												{req.justificacion}
											</TableCell>

											<TableCell className="py-3 text-xs text-slate-500 whitespace-nowrap">
												<div className="flex items-center gap-1.5">
													<Calendar className="w-3.5 h-3.5 text-slate-400" />
													<span>
														{new Date(req.fechaRequerida).toLocaleDateString(
															'es-VE',
															{ timeZone: 'UTC' },
														)}
													</span>
												</div>
											</TableCell>

											<TableCell className="py-3 text-right pr-5">
												<div
													className="flex items-center justify-end gap-1.5"
													onClick={(e) => e.stopPropagation()}
												>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 rounded-md text-slate-500 hover:text-slate-900 cursor-pointer"
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
																onClick={() =>
																	handleOpenAction(req, 'DEVOLVER')
																}
																className="h-8 px-2.5 rounded-md text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 gap-1 cursor-pointer"
															>
																<RotateCcw className="w-3 h-3" />
																Devolver
															</Button>

															{/* Rechazar */}
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	handleOpenAction(req, 'RECHAZAR')
																}
																className="h-8 px-2.5 rounded-md text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/60 gap-1 cursor-pointer"
															>
																<XCircle className="w-3 h-3" />
																Rechazar
															</Button>

															{/* Aprobar */}
															<Button
																size="sm"
																onClick={() => handleOpenAction(req, 'APROBAR')}
																className="h-8 px-3 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
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
				<Dialog
					open={!!selectedReq}
					onOpenChange={(open) => !open && setSelectedReq(null)}
				>
					<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-zinc-800 rounded-lg p-0 overflow-hidden shadow-2xl">
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
									<p className="p-3 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-700 dark:text-slate-300">
										{selectedReq.justificacion}
									</p>
								</div>

								{/* Items */}
								<div className="space-y-2">
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
										Artículos Solicitados ({selectedReq.items?.length || 0})
									</span>
									<div className="rounded-md border border-slate-200 dark:border-zinc-800 overflow-hidden">
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
														<td className="p-2.5 font-medium">
															{item.descripcion}
														</td>
														<td className="p-2.5">{Number(item.cantidad)}</td>
														<td className="p-2.5">{item.unidad}</td>
														<td className="p-2.5 text-right font-mono">
															{item.costoEstimado
																? formatMontoBs(
																		Number(item.costoEstimado),
																		true,
																	)
																: '-'}
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
				<Dialog
					open={!!modalAction}
					onOpenChange={(open) => !open && setModalAction(null)}
				>
					<DialogContent className="sm:max-w-md bg-white dark:bg-[#151518] rounded-lg p-5 sm:p-6 border border-slate-200/80 dark:border-zinc-800">
						<DialogHeader>
							<DialogTitle className="text-base sm:text-lg font-bold">
								{modalAction === 'APROBAR' && 'Aprobar Requisición'}
								{modalAction === 'RECHAZAR' && 'Rechazar Requisición'}
								{modalAction === 'DEVOLVER' && 'Devolver para Corrección'}
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 pt-2">
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{modalAction === 'APROBAR' &&
									'Confirma que autorizas el pedido. Pasará a la bandeja de Compras.'}
								{modalAction === 'RECHAZAR' &&
									'Indica el motivo por el cual no procede la requisición (obligatorio).'}
								{modalAction === 'DEVOLVER' &&
									'Describe qué debe corregir el solicitante para poder autorizarla (obligatorio).'}
							</p>

							{errorAccion && (
								<div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
									<AlertCircle className="w-4 h-4 shrink-0" />
									<span>{errorAccion}</span>
								</div>
							)}

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
									{modalAction === 'APROBAR'
										? 'Comentario de Aprobación (Opcional)'
										: 'Motivo / Comentario Obligatorio *'}
								</label>
								<Textarea
									placeholder="Escribe tu motivo o comentario aquí..."
									rows={3}
									value={comentarioAccion}
									onChange={(e) => setComentarioAccion(e.target.value)}
									className="text-xs rounded-md"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setModalAction(null)}
									disabled={isPending}
									className="rounded-md text-xs h-9 cursor-pointer"
								>
									Cancelar
								</Button>

								<Button
									size="sm"
									disabled={isPending}
									onClick={handleExecuteAction}
									className={`rounded-md text-xs h-9 text-white font-semibold cursor-pointer ${
										modalAction === 'APROBAR'
											? 'bg-emerald-600 hover:bg-emerald-700'
											: modalAction === 'RECHAZAR'
												? 'bg-rose-600 hover:bg-rose-700'
												: 'bg-orange-600 hover:bg-orange-700'
									}`}
								>
									{isPending ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
									) : null}
									Confirmar{' '}
									{modalAction === 'APROBAR'
										? 'Aprobación'
										: modalAction === 'RECHAZAR'
											? 'Rechazo'
											: 'Devolución'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

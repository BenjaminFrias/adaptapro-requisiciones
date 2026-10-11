'use client';

import { useState } from 'react';
import { EstadoBadge } from './EstadoBadge';
import {
	AccionRequisicionModal,
	type RequisicionModalAction,
} from './AccionRequisicionModal';
import { RequisicionDetalleModal } from './RequisicionDetalleModal';
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
	Search,
	Send,
	XCircle,
	Eye,
	Package,
	Calendar,
	Flame,
	X,
	Layers,
	Edit3,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import {
	ESTADOS_FILTRO_DASHBOARD,
	getEstadoLabel,
} from '@/constants/requisicion';

interface RequisicionesListProps {
	requisiciones: RequisicionConRelaciones[];
	onEditar?: (req: RequisicionConRelaciones) => void;
}

export function RequisicionesList({ requisiciones, onEditar }: RequisicionesListProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Estados para el modal de acción (Enviar / Reenviar / Cancelar)
	const [modalAction, setModalAction] =
		useState<RequisicionModalAction | null>(null);
	const [reqParaAccion, setReqParaAccion] =
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

	const handleOpenEnviar = (req: RequisicionConRelaciones) => {
		setReqParaAccion(req);
		setModalAction('ENVIAR');
	};

	const handleOpenCancelar = (req: RequisicionConRelaciones) => {
		setReqParaAccion(req);
		setModalAction('CANCELAR');
	};

	const handleActionSuccess = () => {
		if (selectedReq?.id === reqParaAccion?.id) {
			setSelectedReq(null);
		}
	};

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
						items={ESTADOS_FILTRO_DASHBOARD}
						value={filtroEstado}
						onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
					>
						<SelectTrigger className="h-10.5 min-w-50 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl focus:ring-[#301996]/20 px-3.5">
							<SelectValue placeholder="Todos los estados">
								{(val) => getEstadoLabel(val) || 'Todos los estados'}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
							{ESTADOS_FILTRO_DASHBOARD.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
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

											{/* Botón Editar (solo BORRADOR o DEVUELTA) */}
											{(req.estado === 'BORRADOR' || req.estado === 'DEVUELTA') &&
												onEditar && (
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
														onClick={() => onEditar(req)}
														title="Editar / Corregir Requisición"
													>
														<Edit3 className="w-4 h-4" />
													</Button>
												)}

											{/* Botón Enviar a Aprobación (solo BORRADOR o DEVUELTA) */}
											{(req.estado === 'BORRADOR' ||
												req.estado === 'DEVUELTA') && (
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
													onClick={() => handleOpenEnviar(req)}
													title={
														req.estado === 'DEVUELTA'
															? 'Reenviar a Aprobación'
															: 'Enviar a Aprobación'
													}
												>
													<Send className="w-4 h-4" />
												</Button>
											)}

											{/* Botón Cancelar (solo estados no finales) */}
											{req.estado !== 'APROBADA' &&
												req.estado !== 'EN_COMPRA' &&
												req.estado !== 'ATENDIDA' &&
												req.estado !== 'RECHAZADA' &&
												req.estado !== 'CANCELADA' && (
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
														onClick={() => handleOpenCancelar(req)}
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
			<RequisicionDetalleModal
				requisicion={selectedReq}
				open={!!selectedReq}
				onClose={() => setSelectedReq(null)}
				onEnviar={handleOpenEnviar}
				onCancelar={handleOpenCancelar}
			/>

			{/* Modal de Acción (Confirmar Envío / Reenvío o Cancelación con Observación) */}
			<AccionRequisicionModal
				key={
					reqParaAccion && modalAction
						? `${reqParaAccion.id}-${modalAction}`
						: 'accion-modal'
				}
				action={modalAction}
				requisicion={reqParaAccion}
				onClose={() => {
					setModalAction(null);
					setReqParaAccion(null);
				}}
				onSuccess={handleActionSuccess}
			/>
		</div>
	);
}

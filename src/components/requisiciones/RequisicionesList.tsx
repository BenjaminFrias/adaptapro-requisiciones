'use client';

import { useState, useMemo } from 'react';
import { cn } from 'cn';
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
	Search,
	Send,
	XCircle,
	Eye,
	Package,
	X,
	Edit3,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { getEstadoLabel } from '@/constants/requisicion';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';

interface RequisicionesListProps {
	requisiciones: RequisicionConRelaciones[];
	onEditar?: (req: RequisicionConRelaciones) => void;
}

export function RequisicionesList({
	requisiciones,
	onEditar,
}: RequisicionesListProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Estados para el modal de acción (Enviar / Reenviar / Cancelar)
	const [modalAction, setModalAction] = useState<RequisicionModalAction | null>(
		null,
	);
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

	// Paginación reactiva sobre la lista filtrada
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
		items: requisicionesFiltradas,
		initialPageSize: 15,
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

	// Conteos reactivos por estado para los tabs
	const conteosPorEstado = useMemo(() => {
		const counts: Record<string, number> = {
			TODOS: requisiciones.length,
		};
		requisiciones.forEach((r) => {
			counts[r.estado] = (counts[r.estado] || 0) + 1;
		});
		return counts;
	}, [requisiciones]);

	// Pestañas base y pestañas dinámicas para estados con solicitudes activas
	const tabsEstado = useMemo(() => {
		const base = [
			{ value: 'TODOS', label: 'Todas' },
			{ value: 'PENDIENTE_APROBACION', label: 'En aprobación' },
			{ value: 'APROBADA', label: 'Aprobadas' },
			{ value: 'BORRADOR', label: 'Borradores' },
			{ value: 'DEVUELTA', label: 'Devueltas' },
		];

		// Agregar estados adicionales si tienen al menos 1 registro (ej. EN_COMPRA, ATENDIDA, CANCELADA)
		const extra = Object.keys(conteosPorEstado)
			.filter(
				(st) =>
					st !== 'TODOS' &&
					!base.some((b) => b.value === st) &&
					(conteosPorEstado[st] || 0) > 0,
			)
			.map((st) => ({
				value: st,
				label: getEstadoLabel(st),
			}));

		return [...base, ...extra];
	}, [conteosPorEstado]);

	return (
		<div className="space-y-4">
			{/* Data Grid con Cabecera Integrada */}
			<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
				{/* Cabecera integrada: Tabs rápidos de estado + Buscador compacto */}
				<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
					{/* Tabs rápidos de estado */}
					<div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
						{tabsEstado.map((tab) => {
							const isActive = filtroEstado === tab.value;
							return (
								<button
									key={tab.value}
									type="button"
									onClick={() => setFiltroEstado(tab.value)}
									className={cn(
										'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer select-none',
										isActive
											? 'bg-[#035786] text-white font-medium shadow-none'
											: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium',
									)}
								>
									{tab.label}
								</button>
							);
						})}
					</div>

					{/* Buscador compacto a la derecha */}
					<div className="relative w-full md:w-64 shrink-0">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
						<Input
							placeholder="Buscar requisición..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="h-8.5 pl-8 pr-7 text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus-visible:bg-white focus-visible:border-[#035786]"
						/>
						{busqueda && (
							<button
								type="button"
								onClick={() => setBusqueda('')}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
								Tipo / prioridad
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Justificación
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Fecha requerida
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Artículos
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Estado
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 text-right pr-5">
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
										<div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
											<Package className="w-5 h-5 stroke-[1.5]" />
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
							paginatedItems.map((req) => (
								<TableRow
									key={req.id}
									onClick={() => setSelectedReq(req)}
									className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group"
								>
									{/* Correlativo */}
									<TableCell className="py-3 pl-5">
										{req.numero ? (
											<span className="font-mono font-medium text-xs text-[#035786] dark:text-sky-400 bg-[#035786]/10 dark:bg-[#035786]/20 px-2 py-0.5 rounded-md border border-[#035786]/20">
												{req.numero}
											</span>
										) : (
											<span className="text-slate-500 font-normal italic text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-200/60">
												Borrador #{req.id}
											</span>
										)}
									</TableCell>

									{/* Tipo / Prioridad */}
									<TableCell className="py-3 text-xs">
										<div className="flex items-center gap-1.5 flex-wrap">
											<span className="font-medium text-slate-700 dark:text-slate-300">
												{req.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
											</span>
											{req.prioridad === 'URGENTE' && (
												<span className="inline-flex items-center text-[10px] font-medium text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.5 rounded-md border border-red-200/80 dark:border-red-900/60">
													Urgente
												</span>
											)}
										</div>
									</TableCell>

									{/* Justificación */}
									<TableCell className="py-3 text-xs text-slate-900 dark:text-white max-w-sm truncate font-medium group-hover:text-[#035786] dark:group-hover:text-sky-400 transition-colors">
										<span title={req.justificacion}>{req.justificacion}</span>
									</TableCell>

									{/* Fecha Requerida */}
									<TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
										{new Date(req.fechaRequerida).toLocaleDateString(
											'es-VE',
											{
												timeZone: 'UTC',
											},
										)}
									</TableCell>

									{/* Cantidad de Items */}
									<TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
										{req.items?.length || 0}{' '}
										{req.items?.length === 1 ? 'ítem' : 'ítems'}
									</TableCell>

									{/* Estado Badge */}
									<TableCell className="py-3">
										<EstadoBadge estado={req.estado} />
									</TableCell>

									{/* Acciones */}
									<TableCell className="py-3 text-right pr-5">
										<div
											className="flex items-center justify-end gap-1"
											onClick={(e) => e.stopPropagation()}
										>
											{/* Botón Ver Detalle */}
											<Button
												variant="ghost"
												size="icon-sm"
												className="text-slate-500 hover:text-[#035786] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedReq(req);
												}}
												title="Ver Detalle Completo"
											>
												<Eye className="w-4 h-4" />
											</Button>

											{/* Botón Editar (solo BORRADOR o DEVUELTA) */}
											{(req.estado === 'BORRADOR' ||
												req.estado === 'DEVUELTA') &&
												onEditar && (
													<Button
														variant="ghost"
														size="icon-sm"
														className="text-slate-500 hover:text-amber-600 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 transition-colors"
														onClick={(e) => {
															e.stopPropagation();
															onEditar(req);
														}}
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
													size="icon-sm"
													className="text-slate-500 hover:text-[#035786] hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenEnviar(req);
													}}
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
														size="icon-sm"
														className="text-slate-400 hover:text-red-600 hover:bg-red-50/70 dark:hover:bg-red-950/30 transition-colors"
														onClick={(e) => {
															e.stopPropagation();
															handleOpenCancelar(req);
														}}
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

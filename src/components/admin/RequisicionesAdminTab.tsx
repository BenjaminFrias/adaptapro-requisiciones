'use client';

import { useState } from 'react';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Timeline } from '@/components/requisiciones/Timeline';
import { exportarRequisicionesCSV } from '@/utils/exportCsv';
import { formatMontoBs } from '@/utils/currency';
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
	Download,
	Printer,
	Users,
	Building,
	DollarSign,
	FileText,
	Search,
	Eye,
	X,
} from 'lucide-react';
import Link from 'next/link';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { ESTADOS_FILTRO_ADMIN, getEstadoLabel } from '@/constants/requisicion';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';

interface RequisicionesAdminTabProps {
	requisiciones: RequisicionConRelaciones[];
	metricas: {
		totalRequisiciones: number;
		totalUsuarios: number;
		totalDepartamentos: number;
		totalMontoCompras: number;
	};
}

export function RequisicionesAdminTab({
	requisiciones,
	metricas,
}: RequisicionesAdminTabProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [filtroDepto, setFiltroDepto] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Departamentos para filtro de requisiciones
	const departamentosReq = Array.from(
		new Set(requisiciones.map((r) => r.departamento?.nombre).filter(Boolean)),
	) as string[];

	// Conteo de requisiciones por estado
	const contadores = {
		pendientes: requisiciones.filter((r) => r.estado === 'PENDIENTE_APROBACION')
			.length,
		aprobadas: requisiciones.filter((r) => r.estado === 'APROBADA').length,
		enCompra: requisiciones.filter((r) => r.estado === 'EN_COMPRA').length,
		atendidas: requisiciones.filter((r) => r.estado === 'ATENDIDA').length,
		rechazadas: requisiciones.filter((r) => r.estado === 'RECHAZADA').length,
		canceladas: requisiciones.filter((r) => r.estado === 'CANCELADA').length,
	};

	const listaFiltradaReq = requisiciones.filter((req) => {
		const coincideTexto =
			(req.numero &&
				req.numero.toLowerCase().includes(busqueda.toLowerCase())) ||
			req.justificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
			(req.solicitante?.nombre &&
				req.solicitante.nombre
					.toLowerCase()
					.includes(busqueda.toLowerCase())) ||
			(req.comprasDatos?.proveedor &&
				req.comprasDatos.proveedor
					.toLowerCase()
					.includes(busqueda.toLowerCase()));

		const coincideEstado =
			filtroEstado === 'TODOS' || req.estado === filtroEstado;
		const coincideDepto =
			filtroDepto === 'TODOS' || req.departamento?.nombre === filtroDepto;

		return coincideTexto && coincideEstado && coincideDepto;
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
		items: listaFiltradaReq,
		initialPageSize: 15,
	});

	const handleExportCSV = () => {
		exportarRequisicionesCSV(listaFiltradaReq, 'reporte_global_requisiciones');
	};

	return (
		<div className="space-y-6">
			{/* 4 KPIs de Alto Nivel */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
				<div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
							Total Requisiciones
						</span>
						<div className="w-8 h-8 rounded-md bg-[#035786]/10 dark:bg-[#035786]/20 text-[#035786] dark:text-sky-400 flex items-center justify-center">
							<FileText className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
						{metricas.totalRequisiciones}
					</div>
					<p className="text-[11px] text-slate-400 mt-0.5">
						En todos los departamentos
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
							Monto Compras Final
						</span>
						<div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
							<DollarSign className="w-4 h-4" />
						</div>
					</div>
					<div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
						{formatMontoBs(metricas.totalMontoCompras, true)}
					</div>
					<p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
						Órdenes procesadas
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
							Usuarios Activos
						</span>
						<div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[#035786] dark:text-sky-400 flex items-center justify-center">
							<Users className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
						{metricas.totalUsuarios}
					</div>
					<p className="text-[11px] text-slate-400 mt-0.5">
						Empleados con acceso
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
							Departamentos
						</span>
						<div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
							<Building className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
						{metricas.totalDepartamentos}
					</div>
					<p className="text-[11px] text-slate-400 mt-0.5">Áreas funcionales</p>
				</div>
			</div>

			{/* Tarjetas de Distribución por Estado */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
				<div className="p-3 rounded-md bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-900 dark:text-amber-300">
					<span className="font-medium block text-[10px] uppercase">
						En Aprobación
					</span>
					<span className="text-xl font-bold">{contadores.pendientes}</span>
				</div>
				<div className="p-3 rounded-md bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300">
					<span className="font-medium block text-[10px] uppercase">
						Aprobadas
					</span>
					<span className="text-xl font-bold">{contadores.aprobadas}</span>
				</div>
				<div className="p-3 rounded-md bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/50 text-sky-900 dark:text-sky-300">
					<span className="font-medium block text-[10px] uppercase">
						En Compra
					</span>
					<span className="text-xl font-bold">{contadores.enCompra}</span>
				</div>
				<div className="p-3 rounded-md bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 text-purple-900 dark:text-purple-300">
					<span className="font-medium block text-[10px] uppercase">
						Atendidas
					</span>
					<span className="text-xl font-bold">{contadores.atendidas}</span>
				</div>
				<div className="p-3 rounded-md bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 text-rose-900 dark:text-rose-300">
					<span className="font-medium block text-[10px] uppercase">
						Rechazadas
					</span>
					<span className="text-xl font-bold">{contadores.rechazadas}</span>
				</div>
				<div className="p-3 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300">
					<span className="font-medium block text-[10px] uppercase">
						Canceladas
					</span>
					<span className="text-xl font-bold">{contadores.canceladas}</span>
				</div>
			</div>

			{/* Tabla General de Requisiciones del Sistema con Cabecera Integrada */}
			<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
				{/* Cabecera integrada: Filtros a la izquierda + Buscador y Exportar CSV a la derecha (todo en 1 línea) */}
				<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
					{/* Filtros por Departamento y Estado */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						<div className="w-full sm:w-44 shrink-0">
							<Select
								value={filtroDepto}
								onValueChange={(val) => setFiltroDepto(val || 'TODOS')}
							>
								<SelectTrigger size="sm" className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5">
									<SelectValue placeholder="Todos los dptos.">
										{(val) =>
											val === 'TODOS' || !val ? 'Todos los dptos.' : val
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
									<SelectItem value="TODOS">Todos los dptos.</SelectItem>
									{departamentosReq.map((d) => (
										<SelectItem key={d} value={d}>
											{d}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="w-full sm:w-40 shrink-0">
							<Select
								items={ESTADOS_FILTRO_ADMIN}
								value={filtroEstado}
								onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
							>
								<SelectTrigger size="sm" className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5">
									<SelectValue placeholder="Todos los estados">
										{(val) => getEstadoLabel(val) || 'Todos los estados'}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
									{ESTADOS_FILTRO_ADMIN.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Búsqueda compacta y Botón Exportar CSV (azul default) */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						<div className="relative w-full sm:w-60 shrink-0">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
							<Input
								placeholder="Buscar correlativo, usuario..."
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

						<Button
							size="sm"
							onClick={handleExportCSV}
							className="h-8.5 px-3 rounded-md text-xs font-semibold gap-1.5 shrink-0 shadow-xs"
						>
							<Download className="w-3.5 h-3.5" />
							<span>Exportar CSV</span>
						</Button>
					</div>
				</div>

				<Table>
					<TableHeader className="bg-slate-50/75 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 pl-5">
								Correlativo
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Solicitante / Dpto.
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Tipo / prioridad
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Fecha
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Items
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
						{listaFiltradaReq.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-36 text-center text-xs text-slate-500"
								>
									No se encontraron requisiciones coincidentes con los filtros
									aplicados.
								</TableCell>
							</TableRow>
						) : (
							paginatedItems.map((req) => (
								<TableRow
									key={req.id}
									onClick={() => setSelectedReq(req)}
									className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group"
								>
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

									<TableCell className="py-3 text-xs">
										<div className="font-medium text-slate-800 dark:text-slate-200">
											{req.solicitante?.nombre || 'N/A'}
										</div>
										<span className="text-[11px] text-slate-400">
											{req.departamento?.nombre || '-'}
										</span>
									</TableCell>

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

									<TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
										{new Date(req.fechaRequerida).toLocaleDateString(
											'es-VE',
											{ timeZone: 'UTC' },
										)}
									</TableCell>

									<TableCell className="py-3 text-xs">
										<span className="font-medium text-slate-700 dark:text-slate-300">
											{req.items?.length || 0} ítems
										</span>
									</TableCell>

									<TableCell className="py-3">
										<EstadoBadge estado={req.estado} />
									</TableCell>

									<TableCell className="py-3 text-right pr-5">
										<div className="flex items-center justify-end gap-1.5">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedReq(req);
												}}
												title="Ver Detalle y Trazabilidad"
											>
												<Eye className="w-4 h-4" />
											</Button>

											<Link
												href={`/requisiciones/${req.id}/imprimir`}
												target="_blank"
												onClick={(e) => e.stopPropagation()}
												className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-[#035786] dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
												title="Comprobante Imprimible / PDF"
											>
												<Printer className="w-4 h-4" />
											</Link>
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

			{/* Modal Detalle Completo de Requisición */}
			<Dialog
				open={!!selectedReq}
				onOpenChange={(open) => !open && setSelectedReq(null)}
			>
				<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
					<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-base sm:text-lg font-bold">
									Requisición:{' '}
									{selectedReq?.numero || `Borrador #${selectedReq?.id}`}
								</DialogTitle>
								<p className="text-xs text-slate-500 dark:text-zinc-400">
									Solicitante: {selectedReq?.solicitante?.nombre} (
									{selectedReq?.departamento?.nombre})
								</p>
							</div>
							{selectedReq && <EstadoBadge estado={selectedReq.estado} />}
						</div>
					</DialogHeader>

					{selectedReq && (
						<div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
							<div className="space-y-1">
								<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
									Justificación
								</span>
								<p className="p-3 rounded-md bg-slate-50 dark:bg-zinc-800 text-xs text-slate-700 dark:text-slate-300">
									{selectedReq.justificacion}
								</p>
							</div>

							{/* Items */}
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

							{/* Datos Compras */}
							{selectedReq.comprasDatos && (
								<div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-md border border-sky-200/60 dark:border-sky-900/40 text-xs space-y-1">
									<span className="font-semibold text-[#035786] dark:text-sky-400 uppercase text-[10px]">
										Datos de Compra
									</span>
									<p>
										<strong>Proveedor:</strong>{' '}
										{selectedReq.comprasDatos.proveedor} |{' '}
										<strong>Orden:</strong>{' '}
										{selectedReq.comprasDatos.numeroOrdenCompra}
									</p>
									<p>
										<strong>Costo Final:</strong>{' '}
										{formatMontoBs(
											Number(selectedReq.comprasDatos.costoFinal),
											true,
										)}
									</p>
								</div>
							)}

							{/* Timeline */}
							<div className="space-y-2 pt-2">
								<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
									Línea de Tiempo y Trazabilidad
								</span>
								<Timeline historial={selectedReq.historial} />
							</div>

							<div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
								<Link
									href={`/requisiciones/${selectedReq.id}/imprimir`}
									target="_blank"
									className="inline-flex items-center gap-1.5 text-xs font-medium text-[#035786] dark:text-sky-400 hover:underline"
								>
									<Printer className="w-3.5 h-3.5" />
									Abrir Comprobante Imprimible
								</Link>

								<Button
									type="button"
									variant="outline"
									onClick={() => setSelectedReq(null)}
									className="text-xs h-8.5 rounded-md"
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

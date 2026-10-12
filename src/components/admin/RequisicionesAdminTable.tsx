'use client';

import { useState, useMemo } from 'react';
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
import { Search, Download, Eye, Printer, X } from 'lucide-react';
import Link from 'next/link';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { exportarRequisicionesCSV } from '@/utils/exportCsv';
import { ESTADOS_FILTRO_ADMIN, getEstadoLabel } from '@/constants/requisicion';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { RequisicionAdminDetalleModal } from './RequisicionAdminDetalleModal';

interface RequisicionesAdminTableProps {
	requisiciones: RequisicionConRelaciones[];
}

export function RequisicionesAdminTable({
	requisiciones,
}: RequisicionesAdminTableProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [filtroDepto, setFiltroDepto] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Departamentos para filtro de requisiciones
	const departamentosReq = useMemo(() => {
		return Array.from(
			new Set(requisiciones.map((r) => r.departamento?.nombre).filter(Boolean)),
		) as string[];
	}, [requisiciones]);

	// Lista filtrada
	const listaFiltradaReq = useMemo(() => {
		const query = busqueda.toLowerCase().trim();
		return requisiciones.filter((req) => {
			const coincideTexto =
				!query ||
				Boolean(
					(req.numero && req.numero.toLowerCase().includes(query)) ||
					req.justificacion.toLowerCase().includes(query) ||
					(req.solicitante?.nombre &&
						req.solicitante.nombre.toLowerCase().includes(query)) ||
					(req.comprasDatos?.proveedor &&
						req.comprasDatos.proveedor.toLowerCase().includes(query)),
				);

			const coincideEstado =
				filtroEstado === 'TODOS' || req.estado === filtroEstado;
			const coincideDepto =
				filtroDepto === 'TODOS' || req.departamento?.nombre === filtroDepto;

			return coincideTexto && coincideEstado && coincideDepto;
		});
	}, [requisiciones, busqueda, filtroEstado, filtroDepto]);

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
		<>
			<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
				{/* Cabecera integrada: Filtros a la izquierda + Buscador y Exportar CSV a la derecha */}
				<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
					{/* Filtros por Departamento y Estado */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						<div className="w-full sm:w-44 shrink-0">
							<Select
								value={filtroDepto}
								onValueChange={(val) => setFiltroDepto(val || 'TODOS')}
							>
								<SelectTrigger
									size="sm"
									className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5"
								>
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
								<SelectTrigger
									size="sm"
									className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5"
								>
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

					{/* Búsqueda compacta y Botón Exportar CSV */}
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

				{/* Tabla */}
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
			<RequisicionAdminDetalleModal
				requisicion={selectedReq}
				open={!!selectedReq}
				onClose={() => setSelectedReq(null)}
			/>
		</>
	);
}

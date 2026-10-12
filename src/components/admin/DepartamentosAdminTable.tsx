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
import {
	Search,
	X,
	Pencil,
	Power,
	CheckCircle2,
	XCircle,
	Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DepartamentoAdmin } from '@/types/admin';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';
import { DepartamentoModal } from './DepartamentoModal';
import { ConfirmarEstadoDepartamentoModal } from './ConfirmarEstadoDepartamentoModal';

interface DepartamentosAdminTableProps {
	departamentos: DepartamentoAdmin[];
}

export function DepartamentosAdminTable({
	departamentos,
}: DepartamentosAdminTableProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');

	// Modales
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [departamentoAEditar, setDepartamentoAEditar] =
		useState<DepartamentoAdmin | null>(null);
	const [departamentoAToggle, setDepartamentoAToggle] =
		useState<DepartamentoAdmin | null>(null);

	// Filtros reactivos con useMemo
	const listaFiltrada = useMemo(() => {
		const query = busqueda.toLowerCase().trim();
		return departamentos.filter((d) => {
			const matchTexto = !query || d.nombre.toLowerCase().includes(query);

			const matchEstado =
				filtroEstado === 'TODOS' ||
				(filtroEstado === 'ACTIVOS' && d.activo) ||
				(filtroEstado === 'INACTIVOS' && !d.activo);

			return matchTexto && matchEstado;
		});
	}, [departamentos, busqueda, filtroEstado]);

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
		items: listaFiltrada,
		initialPageSize: 15,
	});

	const handleCrear = () => {
		setDepartamentoAEditar(null);
		setIsModalOpen(true);
	};

	const handleEditar = (depto: DepartamentoAdmin) => {
		setDepartamentoAEditar(depto);
		setIsModalOpen(true);
	};

	return (
		<>
			<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
				{/* Cabecera integrada: Filtros a la izquierda + Buscador y Botón Crear a la derecha */}
				<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
					{/* Filtro por Estado */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						<div className="w-full sm:w-44 shrink-0">
							<Select
								value={filtroEstado}
								onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
							>
								<SelectTrigger
									size="sm"
									className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5"
								>
									<SelectValue placeholder="Todos los estados">
										{filtroEstado === 'TODOS'
											? 'Todos los estados'
											: filtroEstado === 'ACTIVOS'
												? 'Solo activos'
												: 'Solo inactivos'}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
									<SelectItem value="TODOS">Todos los estados</SelectItem>
									<SelectItem value="ACTIVOS">Solo activos</SelectItem>
									<SelectItem value="INACTIVOS">Solo inactivos</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Búsqueda compacta y Botón Crear */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						<div className="relative w-full sm:w-60 shrink-0">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
							<Input
								placeholder="Buscar departamento..."
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
							onClick={handleCrear}
							className="h-8.5 px-3 rounded-md text-xs font-semibold gap-1.5 shrink-0 shadow-xs"
						>
							<Plus className="w-3.5 h-3.5" />
							<span>Nuevo Departamento</span>
						</Button>
					</div>
				</div>

				{/* Tabla de Departamentos */}
				<Table>
					<TableHeader className="bg-slate-50/75 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 pl-5">
								Departamento
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Usuarios Asignados
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Requisiciones Asociadas
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
						{listaFiltrada.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-36 text-center text-xs text-slate-500"
								>
									No se encontraron departamentos coincidentes con los filtros
									aplicados.
								</TableCell>
							</TableRow>
						) : (
							paginatedItems.map((depto) => (
								<TableRow
									key={depto.id}
									className={cn(
										'hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group',
										!depto.activo && 'opacity-65 bg-slate-50/40 dark:bg-zinc-900/40',
									)}
								>
									{/* Nombre e ID */}
									<TableCell className="py-3 pl-5">
										<div className="flex items-center gap-2.5">
											<span className="font-mono font-medium text-xs text-[#035786] dark:text-sky-400 bg-[#035786]/10 dark:bg-[#035786]/20 px-2 py-0.5 rounded-md border border-[#035786]/20">
												#{depto.id}
											</span>
											<span className="font-medium text-xs text-slate-800 dark:text-slate-200">
												{depto.nombre}
											</span>
										</div>
									</TableCell>

									{/* Cantidad Usuarios */}
									<TableCell className="py-3 text-xs">
										<span className="font-medium text-slate-700 dark:text-slate-300">
											{depto._count?.usuarios || 0} usuarios
										</span>
									</TableCell>

									{/* Cantidad Requisiciones */}
									<TableCell className="py-3 text-xs">
										<span className="font-medium text-slate-700 dark:text-slate-300">
											{depto._count?.requisiciones || 0} requisiciones
										</span>
									</TableCell>

									{/* Estado */}
									<TableCell className="py-3">
										{depto.activo ? (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
												<CheckCircle2 className="w-3 h-3" />
												Activo
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
												<XCircle className="w-3 h-3" />
												Inactivo
											</span>
										)}
									</TableCell>

									{/* Acciones */}
									<TableCell className="py-3 text-right pr-5">
										<div className="flex items-center justify-end gap-1.5">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
												onClick={() => handleEditar(depto)}
												title="Editar Departamento"
											>
												<Pencil className="w-4 h-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												className={cn(
													'h-8 w-8 p-0 rounded-md',
													depto.activo
														? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
														: 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
												)}
												onClick={() => setDepartamentoAToggle(depto)}
												title={
													depto.activo
														? 'Inactivar departamento'
														: 'Reactivar departamento'
												}
											>
												<Power className="w-4 h-4" />
											</Button>
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

			{/* Modal Crear / Editar Departamento */}
			<DepartamentoModal
				key={departamentoAEditar?.id ? `edit-${departamentoAEditar.id}` : 'create'}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setDepartamentoAEditar(null);
				}}
				departamentoAEditar={departamentoAEditar}
			/>

			{/* Modal Confirmar Toggle Estado (Activar/Inactivar) */}
			<ConfirmarEstadoDepartamentoModal
				isOpen={!!departamentoAToggle}
				departamento={departamentoAToggle}
				onClose={() => setDepartamentoAToggle(null)}
			/>
		</>
	);
}

'use client';

import { useState } from 'react';
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
	Building2,
	Pencil,
	Power,
	Users,
	FileText,
	CheckCircle2,
	XCircle,
	Plus,
} from 'lucide-react';
import type { DepartamentoAdmin } from '@/types/admin';
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

	// Filtros
	const listaFiltrada = departamentos.filter((d) => {
		const matchTexto = d.nombre.toLowerCase().includes(busqueda.toLowerCase());

		const matchEstado =
			filtroEstado === 'TODOS' ||
			(filtroEstado === 'ACTIVOS' && d.activo) ||
			(filtroEstado === 'INACTIVOS' && !d.activo);

		return matchTexto && matchEstado;
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
		<div className="space-y-4">
			{/* Barra Superior: Búsqueda, Filtro Estado y Botón Crear */}
			<div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<Input
						placeholder="Buscar departamento por nombre..."
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

				<div className="flex flex-wrap items-center gap-2.5">
					{/* Filtro por Estado */}
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
							Estado:
						</span>
						<Select
							value={filtroEstado}
							onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
						>
							<SelectTrigger className="h-10 min-w-36 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl px-3">
								<SelectValue placeholder="Todos">
									{filtroEstado === 'TODOS'
										? 'Todos'
										: filtroEstado === 'ACTIVOS'
											? 'Solo Activos'
											: 'Solo Inactivos'}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
								<SelectItem value="TODOS">Todos</SelectItem>
								<SelectItem value="ACTIVOS">Solo Activos</SelectItem>
								<SelectItem value="INACTIVOS">Solo Inactivos</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Botón Crear Departamento */}
					<Button
						onClick={handleCrear}
						className="h-10 px-4 rounded-xl bg-[#301996] hover:bg-[#25137a] text-white font-medium text-xs sm:text-sm gap-2 shadow-sm shrink-0"
					>
						<Plus className="w-4 h-4" />
						Nuevo Departamento
					</Button>
				</div>
			</div>

			{/* Tabla de Departamentos */}
			<div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
				<Table>
					<TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
								Departamento
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Usuarios Asignados
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Requisiciones Asociadas
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
						{listaFiltrada.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-36 text-center text-xs text-slate-500"
								>
									No se encontraron departamentos coincidentes con los criterios
									de búsqueda.
								</TableCell>
							</TableRow>
						) : (
							listaFiltrada.map((depto) => (
								<TableRow
									key={depto.id}
									className={`hover:bg-slate-50/60 border-b border-slate-100 dark:border-zinc-800/60 ${
										!depto.activo ? 'opacity-70 bg-slate-50/30' : ''
									}`}
								>
									{/* Nombre */}
									<TableCell className="py-3.5 pl-5">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
												<Building2 className="w-4 h-4" />
											</div>
											<div>
												<div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
													{depto.nombre}
												</div>
												<div className="text-[11px] text-slate-400">
													ID: #{depto.id}
												</div>
											</div>
										</div>
									</TableCell>

									{/* Cantidad Usuarios */}
									<TableCell className="py-3.5">
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
											<Users className="w-3.5 h-3.5 text-slate-500" />
											{depto._count?.usuarios || 0} usuarios
										</span>
									</TableCell>

									{/* Cantidad Requisiciones */}
									<TableCell className="py-3.5">
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
											<FileText className="w-3.5 h-3.5 text-slate-500" />
											{depto._count?.requisiciones || 0} requisiciones
										</span>
									</TableCell>

									{/* Estado */}
									<TableCell className="py-3.5">
										{depto.activo ? (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
												<CheckCircle2 className="w-3 h-3" />
												Activo
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
												<XCircle className="w-3 h-3" />
												Inactivo
											</span>
										)}
									</TableCell>

									{/* Acciones */}
									<TableCell className="py-3.5 text-right pr-5">
										<div className="flex items-center justify-end gap-1.5">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-[#301996] hover:bg-slate-100 dark:hover:bg-zinc-800"
												onClick={() => handleEditar(depto)}
												title="Editar Departamento"
											>
												<Pencil className="w-4 h-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												className={`h-8 w-8 p-0 rounded-lg ${
													depto.activo
														? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
														: 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
												}`}
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
		</div>
	);
}

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
	UserPlus,
	Pencil,
	Power,
	Mail,
	Building2,
	CheckCircle2,
	XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UsuarioAdmin, DepartamentoSimple } from '@/types/admin';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';
import { UsuarioModal } from './UsuarioModal';
import { ConfirmarEstadoUsuarioModal } from './ConfirmarEstadoUsuarioModal';

interface UsuariosAdminTableProps {
	usuarios: UsuarioAdmin[];
	departamentos: DepartamentoSimple[];
	currentUser: {
		usuario: string;
		rol: string;
	};
}

export function UsuariosAdminTable({
	usuarios,
	departamentos,
	currentUser,
}: UsuariosAdminTableProps) {
	const [busqueda, setBusqueda] = useState('');
	const [filtroRol, setFiltroRol] = useState('TODOS');
	const [filtroDepto, setFiltroDepto] = useState('TODOS');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');

	// Modales
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [usuarioAEditar, setUsuarioAEditar] = useState<UsuarioAdmin | null>(
		null,
	);
	const [usuarioAToggle, setUsuarioAToggle] = useState<UsuarioAdmin | null>(
		null,
	);

	// Filtros reactivos con useMemo
	const listaFiltrada = useMemo(() => {
		const query = busqueda.toLowerCase().trim();
		return usuarios.filter((u) => {
			const matchTexto =
				!query ||
				Boolean(
					u.nombre.toLowerCase().includes(query) ||
					u.usuario.toLowerCase().includes(query) ||
					u.correo.toLowerCase().includes(query) ||
					(u.departamento?.nombre &&
						u.departamento.nombre.toLowerCase().includes(query)),
				);

			const matchRol = filtroRol === 'TODOS' || u.rol === filtroRol;

			const matchDepto =
				filtroDepto === 'TODOS' || u.departamento?.nombre === filtroDepto;

			const matchEstado =
				filtroEstado === 'TODOS' ||
				(filtroEstado === 'ACTIVOS' && u.activo) ||
				(filtroEstado === 'INACTIVOS' && !u.activo);

			return matchTexto && matchRol && matchDepto && matchEstado;
		});
	}, [usuarios, busqueda, filtroRol, filtroDepto, filtroEstado]);

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

	const getInitials = (name: string) => {
		const parts = name.trim().split(' ');
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	};

	const getRoleBadge = (rol: string) => {
		switch (rol) {
			case 'ADMINISTRADOR':
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
						Administrador
					</span>
				);
			case 'APROBADOR':
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
						Aprobador
					</span>
				);
			case 'COMPRAS':
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-[#035786] dark:bg-blue-950/50 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800/60">
						Compras
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60">
						Solicitante
					</span>
				);
		}
	};

	const handleCrear = () => {
		setUsuarioAEditar(null);
		setIsModalOpen(true);
	};

	const handleEditar = (user: UsuarioAdmin) => {
		setUsuarioAEditar(user);
		setIsModalOpen(true);
	};

	return (
		<>
			<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
				{/* Cabecera integrada: Filtros a la izquierda + Buscador y Botón Crear a la derecha */}
				<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
					{/* Filtros por Rol, Departamento y Estado */}
					<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
						{/* Filtro por Rol */}
						<div className="w-full sm:w-36 shrink-0">
							<Select
								value={filtroRol}
								onValueChange={(val) => setFiltroRol(val || 'TODOS')}
							>
								<SelectTrigger
									size="sm"
									className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5"
								>
									<SelectValue placeholder="Todos los roles">
										{filtroRol === 'TODOS'
											? 'Todos los roles'
											: filtroRol === 'ADMINISTRADOR'
												? 'Administrador'
												: filtroRol === 'APROBADOR'
													? 'Aprobador'
													: filtroRol === 'COMPRAS'
														? 'Compras'
														: 'Solicitante'}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
									<SelectItem value="TODOS">Todos los roles</SelectItem>
									<SelectItem value="SOLICITANTE">Solicitante</SelectItem>
									<SelectItem value="APROBADOR">Aprobador</SelectItem>
									<SelectItem value="COMPRAS">Compras</SelectItem>
									<SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Filtro por Departamento */}
						<div className="w-full sm:w-40 shrink-0">
							<Select
								value={filtroDepto}
								onValueChange={(val) => setFiltroDepto(val || 'TODOS')}
							>
								<SelectTrigger
									size="sm"
									className="h-8.5 w-full text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus:ring-[#035786]/20 px-2.5"
								>
									<SelectValue placeholder="Todos los dptos.">
										{filtroDepto === 'TODOS' || !filtroDepto
											? 'Todos los dptos.'
											: filtroDepto}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
									<SelectItem value="TODOS">Todos los dptos.</SelectItem>
									{departamentos.map((d) => (
										<SelectItem key={d.id} value={d.nombre}>
											{d.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Filtro por Estado */}
						<div className="w-full sm:w-36 shrink-0">
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
								placeholder="Buscar nombre, usuario..."
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
							<UserPlus className="w-3.5 h-3.5" />
							<span>Nuevo Usuario</span>
						</Button>
					</div>
				</div>

				{/* Tabla de Usuarios */}
				<Table>
					<TableHeader className="bg-slate-50/75 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 pl-5">
								Usuario / Nombre
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Correo Electrónico
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Rol
							</TableHead>
							<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
								Departamento
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
									colSpan={6}
									className="h-36 text-center text-xs text-slate-500"
								>
									No se encontraron usuarios coincidentes con los filtros
									aplicados.
								</TableCell>
							</TableRow>
						) : (
							paginatedItems.map((user) => {
								const isSelf = currentUser.usuario === user.usuario;
								return (
									<TableRow
										key={user.id}
										className={cn(
											'hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group',
											!user.activo && 'opacity-65 bg-slate-50/40 dark:bg-zinc-900/40',
										)}
									>
										{/* Usuario y Nombre con Avatar */}
										<TableCell className="py-3 pl-5">
											<div className="flex items-center gap-2.5">
												<div className="w-8 h-8 rounded-md bg-[#035786]/10 text-[#035786] dark:bg-[#035786]/20 dark:text-sky-400 font-semibold text-xs flex items-center justify-center shrink-0 border border-[#035786]/20">
													{getInitials(user.nombre)}
												</div>
												<div>
													<div className="font-medium text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
														{user.nombre}
														{isSelf && (
															<span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.2 rounded-md font-normal">
																Tú
															</span>
														)}
													</div>
													<div className="text-[11px] font-mono text-slate-400">
														@{user.usuario}
													</div>
												</div>
											</div>
										</TableCell>

										{/* Correo Electrónico */}
										<TableCell className="py-3 text-xs text-slate-600 dark:text-slate-300">
											<div className="flex items-center gap-1.5">
												<Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>{user.correo}</span>
											</div>
										</TableCell>

										{/* Rol */}
										<TableCell className="py-3">
											{getRoleBadge(user.rol)}
										</TableCell>

										{/* Departamento */}
										<TableCell className="py-3 text-xs text-slate-600 dark:text-slate-300">
											<div className="flex items-center gap-1.5">
												<Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>{user.departamento?.nombre || '-'}</span>
											</div>
										</TableCell>

										{/* Estado */}
										<TableCell className="py-3">
											{user.activo ? (
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
													onClick={() => handleEditar(user)}
													title="Editar Usuario y Contraseña"
												>
													<Pencil className="w-4 h-4" />
												</Button>

												<Button
													variant="ghost"
													size="sm"
													disabled={isSelf}
													className={cn(
														'h-8 w-8 p-0 rounded-md',
														user.activo
															? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
															: 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
														'disabled:opacity-30 disabled:cursor-not-allowed',
													)}
													onClick={() => setUsuarioAToggle(user)}
													title={
														isSelf
															? 'No puedes inactivar tu propia cuenta'
															: user.activo
																? 'Inactivar usuario'
																: 'Reactivar usuario'
													}
												>
													<Power className="w-4 h-4" />
												</Button>
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

			{/* Modal Crear / Editar Usuario */}
			<UsuarioModal
				key={usuarioAEditar?.id ? `edit-${usuarioAEditar.id}` : 'create'}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setUsuarioAEditar(null);
				}}
				usuarioAEditar={usuarioAEditar}
				departamentos={departamentos}
			/>

			{/* Modal Confirmar Toggle Estado (Activar/Inactivar) */}
			<ConfirmarEstadoUsuarioModal
				isOpen={!!usuarioAToggle}
				usuario={usuarioAToggle}
				onClose={() => setUsuarioAToggle(null)}
			/>
		</>
	);
}

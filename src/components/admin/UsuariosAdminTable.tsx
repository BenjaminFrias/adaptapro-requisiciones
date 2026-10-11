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
	UserPlus,
	Pencil,
	Power,
	Building2,
	Mail,
	CheckCircle2,
	XCircle,
} from 'lucide-react';
import type { UsuarioAdmin, DepartamentoSimple } from '@/types/admin';
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
	const [filtroEstado, setFiltroEstado] = useState('TODOS');

	// Modales
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [usuarioAEditar, setUsuarioAEditar] = useState<UsuarioAdmin | null>(
		null,
	);
	const [usuarioAToggle, setUsuarioAToggle] = useState<UsuarioAdmin | null>(
		null,
	);

	// Filtros
	const listaFiltrada = usuarios.filter((u) => {
		const matchTexto =
			u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
			u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
			u.departamento?.nombre.toLowerCase().includes(busqueda.toLowerCase());

		const matchRol = filtroRol === 'TODOS' || u.rol === filtroRol;

		const matchEstado =
			filtroEstado === 'TODOS' ||
			(filtroEstado === 'ACTIVOS' && u.activo) ||
			(filtroEstado === 'INACTIVOS' && !u.activo);

		return matchTexto && matchRol && matchEstado;
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
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
						Administrador
					</span>
				);
			case 'APROBADOR':
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
						Aprobador
					</span>
				);
			case 'COMPRAS':
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
						Compras
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
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
		<div className="space-y-4">
			{/* Barra Superior: Búsqueda, Filtros y Botón de Crear */}
			<div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<Input
						placeholder="Buscar por nombre, usuario, correo, dpto..."
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
					{/* Filtro por Rol */}
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
							Rol:
						</span>
						<Select
							value={filtroRol}
							onValueChange={(val) => setFiltroRol(val || 'TODOS')}
						>
							<SelectTrigger className="h-10 min-w-36 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl px-3">
								<SelectValue placeholder="Todos los roles">
									{filtroRol === 'TODOS' ? 'Todos los roles' : filtroRol}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
								<SelectItem value="TODOS">Todos los roles</SelectItem>
								<SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
								<SelectItem value="APROBADOR">Aprobador</SelectItem>
								<SelectItem value="COMPRAS">Compras</SelectItem>
								<SelectItem value="SOLICITANTE">Solicitante</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Filtro por Estado */}
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
							Estado:
						</span>
						<Select
							value={filtroEstado}
							onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
						>
							<SelectTrigger className="h-10 min-w-32 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl px-3">
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

					{/* Botón Crear Usuario */}
					<Button
						onClick={handleCrear}
						className="h-10 px-4 rounded-xl bg-[#301996] hover:bg-[#25137a] text-white font-medium text-xs sm:text-sm gap-2 shadow-sm shrink-0"
					>
						<UserPlus className="w-4 h-4" />
						Nuevo Usuario
					</Button>
				</div>
			</div>

			{/* Tabla de Usuarios */}
			<div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
				<Table>
					<TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
						<TableRow className="hover:bg-transparent">
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
								Usuario / Nombre
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Correo Electrónico
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Rol
							</TableHead>
							<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
								Departamento
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
									colSpan={6}
									className="h-36 text-center text-xs text-slate-500"
								>
									No se encontraron usuarios coincidentes con los criterios de
									búsqueda.
								</TableCell>
							</TableRow>
						) : (
							listaFiltrada.map((user) => {
								const isSelf = currentUser.usuario === user.usuario;
								return (
									<TableRow
										key={user.id}
										className={`hover:bg-slate-50/60 border-b border-slate-100 dark:border-zinc-800/60 ${
											!user.activo ? 'opacity-70 bg-slate-50/30' : ''
										}`}
									>
										{/* Usuario y Nombre con Avatar */}
										<TableCell className="py-3.5 pl-5">
											<div className="flex items-center gap-3">
												<div className="w-9 h-9 rounded-full bg-[#301996]/10 text-[#301996] dark:bg-purple-950/60 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-[#301996]/20">
													{getInitials(user.nombre)}
												</div>
												<div>
													<div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
														{user.nombre}
														{isSelf && (
															<span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.2 rounded font-normal">
																Tú
															</span>
														)}
													</div>
													<div className="text-[11px] font-mono text-slate-500">
														@{user.usuario}
													</div>
												</div>
											</div>
										</TableCell>

										{/* Correo Electrónico */}
										<TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-300">
											<div className="flex items-center gap-1.5">
												<Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>{user.correo}</span>
											</div>
										</TableCell>

										{/* Rol */}
										<TableCell className="py-3.5">
											{getRoleBadge(user.rol)}
										</TableCell>

										{/* Departamento */}
										<TableCell className="py-3.5 text-xs text-slate-600 dark:text-slate-300">
											<div className="flex items-center gap-1.5">
												<Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>{user.departamento?.nombre || '-'}</span>
											</div>
										</TableCell>

										{/* Estado */}
										<TableCell className="py-3.5">
											{user.activo ? (
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
													onClick={() => handleEditar(user)}
													title="Editar Usuario y Contraseña"
												>
													<Pencil className="w-4 h-4" />
												</Button>

												<Button
													variant="ghost"
													size="sm"
													disabled={isSelf}
													className={`h-8 w-8 p-0 rounded-lg ${
														user.activo
															? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
															: 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
													} disabled:opacity-30 disabled:cursor-not-allowed`}
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
		</div>
	);
}

'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
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
	ShieldAlert,
	Download,
	Printer,
	Users,
	Building,
	DollarSign,
	FileText,
	Search,
	Eye,
	X,
	UserCheck,
	UserX,
} from 'lucide-react';
import Link from 'next/link';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import type { UsuarioAdmin, DepartamentoSimple } from '@/types/admin';
import { ESTADOS_FILTRO_ADMIN, getEstadoLabel } from '@/constants/requisicion';
import { UsuariosAdminTable } from './UsuariosAdminTable';

interface AdminClientProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
	data: {
		requisiciones: RequisicionConRelaciones[];
		usuarios: UsuarioAdmin[];
		departamentos: DepartamentoSimple[];
		metricas: {
			totalRequisiciones: number;
			totalUsuarios: number;
			totalDepartamentos: number;
			totalMontoCompras: number;
		};
	};
}

export function AdminClient({ user, data }: AdminClientProps) {
	const { requisiciones, usuarios = [], departamentos = [], metricas } = data;
	const [activeTab, setActiveTab] = useState<'requisiciones' | 'usuarios'>(
		'requisiciones',
	);

	// Filtros Requisiciones
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

	// Contadores de usuarios
	const totalUsuariosActivos = usuarios.filter((u) => u.activo).length;
	const totalUsuariosInactivos = usuarios.filter((u) => !u.activo).length;

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

	const handleExportCSV = () => {
		exportarRequisicionesCSV(listaFiltradaReq, 'reporte_global_requisiciones');
	};

	return (
		<div className="min-h-screen bg-[#fafafc] dark:bg-[#0e0e11] flex flex-col antialiased">
			<Navbar user={user} />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
				{/* Encabezado Principal */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
								<ShieldAlert className="w-3.5 h-3.5" />
								Módulo de Administración
							</span>
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
							Panel Global del Sistema
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
							Estadísticas consolidadas, auditoría de requisiciones y gestión de
							usuarios del sistema.
						</p>
					</div>

					{activeTab === 'requisiciones' && (
						<Button
							onClick={handleExportCSV}
							className="h-10 px-4 rounded-xl bg-[#301996] hover:bg-[#25137a] text-white font-medium text-xs sm:text-sm gap-2 shadow-sm self-start sm:self-auto"
						>
							<Download className="w-4 h-4" />
							Exportar a CSV ({listaFiltradaReq.length})
						</Button>
					)}
				</div>

				{/* Navegación por Pestañas */}
				<div className="flex items-center border-b border-slate-200 dark:border-zinc-800 gap-2">
					<button
						type="button"
						onClick={() => setActiveTab('requisiciones')}
						className={`flex items-center gap-2 pb-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 transition-colors relative ${
							activeTab === 'requisiciones'
								? 'border-[#301996] text-[#301996] dark:text-purple-400 dark:border-purple-400'
								: 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
						}`}
					>
						<FileText className="w-4 h-4" />
						Requisiciones del Sistema
						<span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">
							{requisiciones.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab('usuarios')}
						className={`flex items-center gap-2 pb-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 transition-colors relative ${
							activeTab === 'usuarios'
								? 'border-[#301996] text-[#301996] dark:text-purple-400 dark:border-purple-400'
								: 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
						}`}
					>
						<Users className="w-4 h-4" />
						Gestión de Usuarios
						<span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">
							{usuarios.length}
						</span>
					</button>
				</div>

				{/* Contenido Pestaña Requisiciones */}
				{activeTab === 'requisiciones' && (
					<div className="space-y-6">
						{/* 4 KPIs de Alto Nivel */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Total Requisiciones
									</span>
									<div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
										<FileText className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{metricas.totalRequisiciones}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">
									En todos los departamentos
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Monto Compras Final
									</span>
									<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
										<DollarSign className="w-4 h-4" />
									</div>
								</div>
								<div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white truncate">
									{formatMontoBs(metricas.totalMontoCompras, true)}
								</div>
								<p className="text-[11px] text-emerald-600 mt-0.5">
									Órdenes procesadas
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Usuarios Activos
									</span>
									<div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
										<Users className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{metricas.totalUsuarios}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">
									Empleados con acceso
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Departamentos
									</span>
									<div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
										<Building className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{metricas.totalDepartamentos}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">
									Áreas funcionales
								</p>
							</div>
						</div>

						{/* Tarjetas de Distribución por Estado */}
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
							<div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900">
								<span className="font-semibold block text-[10px] uppercase">
									En Aprobación
								</span>
								<span className="text-xl font-bold">
									{contadores.pendientes}
								</span>
							</div>
							<div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-900">
								<span className="font-semibold block text-[10px] uppercase">
									Aprobadas
								</span>
								<span className="text-xl font-bold">
									{contadores.aprobadas}
								</span>
							</div>
							<div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900">
								<span className="font-semibold block text-[10px] uppercase">
									En Compra
								</span>
								<span className="text-xl font-bold">{contadores.enCompra}</span>
							</div>
							<div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/70 text-purple-900">
								<span className="font-semibold block text-[10px] uppercase">
									Atendidas
								</span>
								<span className="text-xl font-bold">
									{contadores.atendidas}
								</span>
							</div>
							<div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/70 text-rose-900">
								<span className="font-semibold block text-[10px] uppercase">
									Rechazadas
								</span>
								<span className="text-xl font-bold">
									{contadores.rechazadas}
								</span>
							</div>
							<div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
								<span className="font-semibold block text-[10px] uppercase">
									Canceladas
								</span>
								<span className="text-xl font-bold">
									{contadores.canceladas}
								</span>
							</div>
						</div>

						{/* Barra de Filtros, Búsqueda y Selectores */}
						<div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Buscar por correlativo, usuario, proveedor..."
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

							<div className="flex flex-col sm:flex-row sm:items-center gap-3">
								{/* Filtro por Departamento */}
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
										Departamento:
									</span>
									<Select
										value={filtroDepto}
										onValueChange={(val) => setFiltroDepto(val || 'TODOS')}
									>
										<SelectTrigger className="h-10.5 min-w-44 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl focus:ring-[#301996]/20 px-3.5">
											<SelectValue placeholder="Todos los dptos.">
												{(val) =>
													val === 'TODOS' || !val ? 'Todos los dptos.' : val
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
											<SelectItem value="TODOS">Todos los dptos.</SelectItem>
											{departamentosReq.map((d) => (
												<SelectItem key={d} value={d}>
													{d}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Filtro por Estado */}
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
										Estado:
									</span>
									<Select
										items={ESTADOS_FILTRO_ADMIN}
										value={filtroEstado}
										onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
									>
										<SelectTrigger className="h-10.5 min-w-44 text-xs sm:text-sm font-medium bg-slate-50/70 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/80 rounded-xl focus:ring-[#301996]/20 px-3.5">
											<SelectValue placeholder="Todos los estados">
												{(val) => getEstadoLabel(val) || 'Todos los estados'}
											</SelectValue>
										</SelectTrigger>
										<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
											{ESTADOS_FILTRO_ADMIN.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						{/* Tabla General de Requisiciones del Sistema */}
						<div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
							<Table>
								<TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
									<TableRow className="hover:bg-transparent">
										<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
											Correlativo
										</TableHead>
										<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
											Solicitante / Dpto.
										</TableHead>
										<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
											Tipo / Prioridad
										</TableHead>
										<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
											Fecha
										</TableHead>
										<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
											Items
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
									{listaFiltradaReq.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={7}
												className="h-36 text-center text-xs text-slate-500"
											>
												No se encontraron requisiciones coincidentes con los
												filtros aplicados.
											</TableCell>
										</TableRow>
									) : (
										listaFiltradaReq.map((req) => (
											<TableRow
												key={req.id}
												className="hover:bg-slate-50/60 border-b border-slate-100"
											>
												<TableCell className="py-3.5 pl-5 font-mono font-bold text-xs text-[#301996]">
													{req.numero || `Borrador #${req.id}`}
												</TableCell>

												<TableCell className="py-3.5 text-xs">
													<div className="font-semibold text-slate-800">
														{req.solicitante?.nombre || 'N/A'}
													</div>
													<span className="text-[11px] text-slate-400">
														{req.departamento?.nombre || '-'}
													</span>
												</TableCell>

												<TableCell className="py-3.5 text-xs">
													<span>
														{req.tipo === 'BIEN' ? 'Bien' : 'Servicio'}
													</span>
													{req.prioridad === 'URGENTE' && (
														<span className="ml-1 text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
															Urgente
														</span>
													)}
												</TableCell>

												<TableCell className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
													{new Date(req.fechaRequerida).toLocaleDateString(
														'es-VE',
														{ timeZone: 'UTC' },
													)}
												</TableCell>

												<TableCell className="py-3.5 text-xs">
													{req.items?.length || 0} ítems
												</TableCell>

												<TableCell className="py-3.5">
													<EstadoBadge estado={req.estado} />
												</TableCell>

												<TableCell className="py-3.5 text-right pr-5">
													<div className="flex items-center justify-end gap-1.5">
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900"
															onClick={() => setSelectedReq(req)}
															title="Ver Detalle y Trazabilidad"
														>
															<Eye className="w-4 h-4" />
														</Button>

														<Link
															href={`/requisiciones/${req.id}/imprimir`}
															target="_blank"
															className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-[#301996] hover:bg-slate-100 transition-colors"
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
						</div>
					</div>
				)}

				{/* Contenido Pestaña Usuarios */}
				{activeTab === 'usuarios' && (
					<div className="space-y-6">
						{/* Tarjetas resumen de Usuarios */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Total Usuarios
									</span>
									<div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
										<Users className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{usuarios.length}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">
									Registrados en el sistema
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Usuarios Activos
									</span>
									<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
										<UserCheck className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{totalUsuariosActivos}
								</div>
								<p className="text-[11px] text-emerald-600 mt-0.5">
									Con acceso al ERP
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Usuarios Inactivos
									</span>
									<div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
										<UserX className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{totalUsuariosInactivos}
								</div>
								<p className="text-[11px] text-rose-600 mt-0.5">
									Cuentas suspendidas
								</p>
							</div>

							<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-slate-500">
										Departamentos
									</span>
									<div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
										<Building className="w-4 h-4" />
									</div>
								</div>
								<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
									{departamentos.length}
								</div>
								<p className="text-[11px] text-slate-400 mt-0.5">
									Disponibles para asignación
								</p>
							</div>
						</div>

						{/* Tabla CRUD de Usuarios */}
						<UsuariosAdminTable
							usuarios={usuarios}
							departamentos={departamentos}
							currentUser={{
								usuario: user.usuario,
								rol: user.rol,
							}}
						/>
					</div>
				)}

				{/* Modal Detalle Completo de Requisición */}
				<Dialog
					open={!!selectedReq}
					onOpenChange={(open) => !open && setSelectedReq(null)}
				>
					<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white rounded-2xl p-0 overflow-hidden shadow-2xl">
						<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
							<div className="flex items-center justify-between">
								<div>
									<DialogTitle className="text-base sm:text-lg font-bold">
										Requisición:{' '}
										{selectedReq?.numero || `Borrador #${selectedReq?.id}`}
									</DialogTitle>
									<p className="text-xs text-slate-500">
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
									<span className="text-xs font-semibold text-slate-700 block">
										Justificación
									</span>
									<p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
										{selectedReq.justificacion}
									</p>
								</div>

								{/* Items */}
								<div className="space-y-2">
									<span className="text-xs font-semibold text-slate-700 block">
										Artículos Solicitados
									</span>
									<div className="rounded-xl border border-slate-200 overflow-hidden">
										<table className="w-full text-left text-xs">
											<thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
												<tr>
													<th className="p-2.5">Descripción</th>
													<th className="p-2.5">Cant.</th>
													<th className="p-2.5">Unidad</th>
													<th className="p-2.5 text-right">Costo Est.</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
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
									<div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs space-y-1">
										<span className="font-bold text-blue-900 uppercase text-[10px]">
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
									<span className="text-xs font-semibold text-slate-700 block">
										Línea de Tiempo y Trazabilidad
									</span>
									<Timeline historial={selectedReq.historial} />
								</div>

								<div className="flex justify-between items-center pt-3 border-t border-slate-200">
									<Link
										href={`/requisiciones/${selectedReq.id}/imprimir`}
										target="_blank"
										className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#301996] hover:underline"
									>
										<Printer className="w-3.5 h-3.5" />
										Abrir Comprobante Imprimible
									</Link>

									<Button
										type="button"
										variant="outline"
										onClick={() => setSelectedReq(null)}
										className="text-xs h-9 rounded-xl"
									>
										Cerrar
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

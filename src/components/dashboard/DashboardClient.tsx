'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RequisicionesList } from '@/components/requisiciones/RequisicionesList';
import { RequisicionForm } from '@/components/requisiciones/RequisicionForm';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Plus,
	FileText,
	CheckCircle2,
	Clock,
	FileEdit,
	Sparkles,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';

interface DashboardClientProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
	requisiciones: RequisicionConRelaciones[];
}

export function DashboardClient({ user, requisiciones }: DashboardClientProps) {
	const [openCrear, setOpenCrear] = useState(false);
	const [reqParaEditar, setReqParaEditar] = useState<RequisicionConRelaciones | null>(null);

	// Métricas rápidas
	const total = requisiciones.length;
	const pendientes = requisiciones.filter(
		(r) => r.estado === 'PENDIENTE_APROBACION',
	).length;
	const aprobadas = requisiciones.filter(
		(r) =>
			r.estado === 'APROBADA' ||
			r.estado === 'EN_COMPRA' ||
			r.estado === 'ATENDIDA',
	).length;
	const borradores = requisiciones.filter(
		(r) => r.estado === 'BORRADOR' || r.estado === 'DEVUELTA',
	).length;

	return (
		<div className="min-h-screen bg-[#fafafc] dark:bg-[#0e0e11] flex flex-col antialiased">
			{/* Barra de navegación superior fija */}
			<Navbar user={user} />

			{/* Contenedor principal */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
				{/* Encabezado y Acción Principal */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="text-[11px] font-bold uppercase tracking-wider text-[#301996] dark:text-[#6a9bcc] flex items-center gap-1">
								<Sparkles className="w-3 h-3 inline" />
								Panel de Solicitudes
							</span>
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
							Mis Requisiciones
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
							Consulta, gestiona y haz seguimiento a tus solicitudes internas de
							bienes y servicios en tiempo real.
						</p>
					</div>

					<Button
						onClick={() => setOpenCrear(true)}
						className="h-10 px-4 rounded-xl bg-[#301996] hover:bg-[#25137a] text-white font-medium text-xs sm:text-sm gap-2 shadow-md shadow-[#301996]/25 hover:shadow-lg hover:shadow-[#301996]/35 active:scale-[0.98] transition-all shrink-0 self-start sm:self-auto"
					>
						<Plus className="w-4 h-4 stroke-[2.5]" />
						Nueva Requisición
					</Button>
				</div>

				{/* Tarjetas KPI de Métricas Principales */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
					{/* KPI 1: Total Creadas */}
					<div className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
						<div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
							<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
								Total Registradas
							</span>
							<div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
								<FileText className="w-4.5 h-4.5" />
							</div>
						</div>
						<div className="space-y-0.5">
							<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
								{total}
							</div>
							<p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
								Histórico de solicitudes
							</p>
						</div>
					</div>

					{/* KPI 2: En Aprobación */}
					<div className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
						<div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
							<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
								En Aprobación
							</span>
							<div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
								<Clock className="w-4.5 h-4.5" />
							</div>
						</div>
						<div className="space-y-0.5">
							<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
								{pendientes}
							</div>
							<p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
								En espera de firma o revisión
							</p>
						</div>
					</div>

					{/* KPI 3: Aprobadas / En Proceso */}
					<div className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
						<div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
							<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
								Aprobadas / Proceso
							</span>
							<div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
								<CheckCircle2 className="w-4.5 h-4.5" />
							</div>
						</div>
						<div className="space-y-0.5">
							<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
								{aprobadas}
							</div>
							<p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
								Procesándose en compras
							</p>
						</div>
					</div>

					{/* KPI 4: Borradores / Devueltas */}
					<div className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
						<div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
							<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
								Borrador / Devueltas
							</span>
							<div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#301996] dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
								<FileEdit className="w-4.5 h-4.5" />
							</div>
						</div>
						<div className="space-y-0.5">
							<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
								{borradores}
							</div>
							<p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
								Requieren tu envío o ajuste
							</p>
						</div>
					</div>
				</div>

				{/* Listado con filtros y tabla */}
				<div className="space-y-4">
					<RequisicionesList
						requisiciones={requisiciones}
						onEditar={(req) => {
							setReqParaEditar(req);
							setOpenCrear(true);
						}}
					/>
				</div>

				{/* Modal de Creación / Edición de Requisición */}
				<Dialog
					open={openCrear}
					onOpenChange={(val) => {
						setOpenCrear(val);
						if (!val) setReqParaEditar(null);
					}}
				>
					<DialogContent className="sm:max-w-4xl w-[96vw] max-w-4xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-2xl">
						<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-200/80 dark:border-zinc-800">
							<div className="flex items-center gap-3">
								<div
									className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#301996]/20 shrink-0"
									style={{
										background:
											'linear-gradient(135deg, #301996 0%, #2563eb 100%)',
									}}
								>
									{/* Ícono Estrella Geométrica */}
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-5 h-5 text-white"
										aria-hidden="true"
									>
										<g transform="translate(12, 12)">
											{[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
												<rect
													key={deg}
													x="-1.5"
													y="-9"
													width="3"
													height="6.8"
													rx="1.5"
													transform={`rotate(${deg})`}
												/>
											))}
											<circle cx="0" cy="0" r="2.2" />
										</g>
									</svg>
								</div>
								<div>
									<DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
										{reqParaEditar
											? `Editar Requisición ${
													reqParaEditar.numero
														? reqParaEditar.numero
														: `(Borrador #${reqParaEditar.id})`
											  }`
											: 'Crear Nueva Requisición'}
									</DialogTitle>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
										{reqParaEditar
											? 'Corrige las partidas o justificación y envíala nuevamente a aprobación.'
											: 'Ingresa los datos del requerimiento para iniciar el ciclo de aprobación interno.'}
									</p>
								</div>
							</div>
						</DialogHeader>

						<div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
							<RequisicionForm
								key={reqParaEditar ? reqParaEditar.id : 'nueva'}
								departamentoNombre={user.departamentoNombre}
								requisicionInicial={reqParaEditar}
								onSuccess={() => {
									setOpenCrear(false);
									setReqParaEditar(null);
								}}
								onCancel={() => {
									setOpenCrear(false);
									setReqParaEditar(null);
								}}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

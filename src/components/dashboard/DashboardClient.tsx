'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from 'cn';
import { Navbar } from '@/components/layout/Navbar';
import { RequisicionesList } from '@/components/requisiciones/RequisicionesList';
import { RequisicionForm } from '@/components/requisiciones/RequisicionForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Plus, FileText, CheckCircle2, Clock, FileEdit } from 'lucide-react';
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
	const [reqParaEditar, setReqParaEditar] =
		useState<RequisicionConRelaciones | null>(null);

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

	const kpiCards = [
		{
			id: 'total',
			titulo: 'Total registradas',
			valor: total,
			subtitulo: 'Histórico de solicitudes',
			icon: FileText,
			destacado: true,
		},
		{
			id: 'pendientes',
			titulo: 'En aprobación',
			valor: pendientes,
			subtitulo: 'En espera de firma o revisión',
			icon: Clock,
			destacado: false,
		},
		{
			id: 'aprobadas',
			titulo: 'Aprobadas / En proceso',
			valor: aprobadas,
			subtitulo: 'Procesándose en compras',
			icon: CheckCircle2,
			destacado: false,
		},
		{
			id: 'borradores',
			titulo: 'Borrador / Devueltas',
			valor: borradores,
			subtitulo: 'Requieren tu envío o ajuste',
			icon: FileEdit,
			destacado: false,
		},
	];

	return (
		<div className="min-h-screen bg-[#fafafc] dark:bg-[#0e0e11] flex flex-col antialiased">
			{/* Barra de navegación superior fija */}
			<Navbar user={user} />

			{/* Contenedor principal */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
				{/* Encabezado y Acción Principal */}
				<PageHeader
					title="Mis requisiciones"
					description="Consulta, gestiona y haz seguimiento a tus solicitudes internas de bienes y servicios en tiempo real."
				>
					<Button
						size="lg"
						onClick={() => setOpenCrear(true)}
						className="shrink-0 self-start sm:self-auto"
					>
						<Plus className="w-4 h-4" />
						Nueva requisición
					</Button>
				</PageHeader>

				{/* Tarjetas KPI de Métricas Principales */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
					{kpiCards.map((kpi) => {
						const Icon = kpi.icon;
						return (
							<div
								key={kpi.id}
								className={cn(
									'p-3.5 sm:p-4 rounded-md border',
									kpi.destacado
										? 'bg-[#035786] text-white border-[#035786]'
										: 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800',
								)}
							>
								<div className="flex items-center justify-between gap-3 mb-2.5">
									<span
										className={cn(
											'text-xs font-medium',
											kpi.destacado
												? 'text-white/80'
												: 'text-slate-500 dark:text-slate-400',
										)}
									>
										{kpi.titulo}
									</span>
									<div
										className={cn(
											'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
											kpi.destacado
												? 'bg-white/15 text-white'
												: 'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
										)}
									>
										<Icon className="w-4 h-4" />
									</div>
								</div>
								<div>
									<div
										className={cn(
											'text-3xl sm:text-5xl font-semibold tracking-tight',
											kpi.destacado
												? 'text-white'
												: 'text-slate-900 dark:text-white',
										)}
									>
										{kpi.valor}
									</div>
									<p
										className={cn(
											'text-xs truncate mt-0.5',
											kpi.destacado
												? 'text-white/75'
												: 'text-slate-400 dark:text-slate-500',
										)}
									>
										{kpi.subtitulo}
									</p>
								</div>
							</div>
						);
					})}
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
								<div className="w-10 h-10 rounded-xl bg-[#035786] flex items-center justify-center p-2 shadow-sm shadow-[#035786]/20 shrink-0">
									<Image
										src="/brand/logo-icono-white.svg"
										alt="AdaptaPro Ícono"
										width={26}
										height={20}
										className="w-full h-auto object-contain"
									/>
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

'use client';

import { cn } from '@/lib/utils';
import { formatMontoBs } from '@/utils/currency';
import { Users, Building, DollarSign, FileText } from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { RequisicionesAdminTable } from './RequisicionesAdminTable';

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

	// 4 KPIs de Alto Nivel con estilo DashboardClient
	const mainKpis = [
		{
			id: 'total-req',
			titulo: 'Total requisiciones',
			valor: metricas.totalRequisiciones,
			subtitulo: 'En todos los departamentos',
			icon: FileText,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'monto-compras',
			titulo: 'Monto en compras',
			valor: formatMontoBs(metricas.totalMontoCompras, true),
			subtitulo: 'Órdenes procesadas',
			icon: DollarSign,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'usuarios-activos',
			titulo: 'Usuarios activos',
			valor: metricas.totalUsuarios,
			subtitulo: 'Empleados con acceso',
			icon: Users,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'departamentos',
			titulo: 'Departamentos',
			valor: metricas.totalDepartamentos,
			subtitulo: 'Áreas funcionales registradas',
			icon: Building,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
	];

	// Tarjetas de cantidad por estado con los colores oficiales de EstadoBadge
	const statusKpis = [
		{
			id: 'pendientes',
			label: 'En aprobación',
			count: contadores.pendientes,
			cardStyle:
				'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40',
			textStyle: 'text-amber-800 dark:text-amber-300',
		},
		{
			id: 'aprobadas',
			label: 'Aprobadas',
			count: contadores.aprobadas,
			cardStyle:
				'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40',
			textStyle: 'text-emerald-800 dark:text-emerald-300',
		},
		{
			id: 'enCompra',
			label: 'En compra',
			count: contadores.enCompra,
			cardStyle:
				'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40',
			textStyle: 'text-blue-800 dark:text-blue-300',
		},
		{
			id: 'atendidas',
			label: 'Atendidas',
			count: contadores.atendidas,
			cardStyle:
				'bg-[#035786]/10 dark:bg-[#035786]/20 border-[#035786]/20 dark:border-[#035786]/30',
			textStyle: 'text-[#035786] dark:text-sky-300',
		},
		{
			id: 'rechazadas',
			label: 'Rechazadas',
			count: contadores.rechazadas,
			cardStyle:
				'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40',
			textStyle: 'text-rose-800 dark:text-rose-300',
		},
		{
			id: 'canceladas',
			label: 'Canceladas',
			count: contadores.canceladas,
			cardStyle:
				'bg-slate-100/70 dark:bg-zinc-800/50 border-slate-200/70 dark:border-zinc-700/60',
			textStyle: 'text-slate-600 dark:text-zinc-400',
		},
	];

	return (
		<div className="space-y-6">
			{/* 4 KPIs de Alto Nivel */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
				{mainKpis.map((kpi) => {
					const Icon = kpi.icon;
					return (
						<div
							key={kpi.id}
							className="p-3.5 sm:p-4 rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
						>
							<div className="flex items-center justify-between gap-3 mb-2.5">
								<span className="text-xs font-medium text-slate-500 dark:text-slate-400">
									{kpi.titulo}
								</span>
								<div
									className={cn(
										'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
										kpi.iconColor,
									)}
								>
									<Icon className="w-4 h-4" />
								</div>
							</div>
							<div>
								<div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
									{kpi.valor}
								</div>
								<p className="text-xs truncate mt-1 text-slate-400 dark:text-slate-500">
									{kpi.subtitulo}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Tarjetas de Cantidad por Estado con Colores Oficiales de EstadoBadge */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
				{statusKpis.map((item) => (
					<div
						key={item.id}
						className={cn(
							'p-3 sm:p-3.5 rounded-md border flex flex-col justify-between transition-all select-none',
							item.cardStyle,
						)}
					>
						<div className="mb-2">
							<span
								className={cn(
									'text-xs font-medium block truncate',
									item.textStyle,
								)}
							>
								{item.label}
							</span>
						</div>
						<div
							className={cn(
								'text-2xl sm:text-3xl font-semibold tracking-tight',
								item.textStyle,
							)}
						>
							{item.count}
						</div>
					</div>
				))}
			</div>

			{/* Tabla General de Requisiciones del Sistema */}
			<RequisicionesAdminTable requisiciones={requisiciones} />
		</div>
	);
}

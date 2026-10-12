'use client';

import { cn } from '@/lib/utils';
import { Building, CheckCircle2, Users, XCircle } from 'lucide-react';
import type { DepartamentoAdmin } from '@/types/admin';
import { DepartamentosAdminTable } from './DepartamentosAdminTable';

interface DepartamentosAdminTabProps {
	departamentos: DepartamentoAdmin[];
	totalUsuarios: number;
}

export function DepartamentosAdminTab({
	departamentos,
	totalUsuarios,
}: DepartamentosAdminTabProps) {
	const totalDeptosActivos = departamentos.filter((d) => d.activo).length;
	const totalDeptosInactivos = departamentos.filter((d) => !d.activo).length;

	// 4 KPIs de Alto Nivel con estilo consistente
	const mainKpis = [
		{
			id: 'total-deptos',
			titulo: 'Total departamentos',
			valor: departamentos.length,
			subtitulo: 'Áreas funcionales registradas',
			icon: Building,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'deptos-activos',
			titulo: 'Departamentos activos',
			valor: totalDeptosActivos,
			subtitulo: 'Operativos para requisiciones',
			icon: CheckCircle2,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'deptos-inactivos',
			titulo: 'Departamentos inactivos',
			valor: totalDeptosInactivos,
			subtitulo: 'Deshabilitados en el sistema',
			icon: XCircle,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'usuarios-asignados',
			titulo: 'Usuarios asignados',
			valor: totalUsuarios,
			subtitulo: 'Distribuidos en áreas',
			icon: Users,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
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

			{/* Tabla de Departamentos */}
			<DepartamentosAdminTable departamentos={departamentos} />
		</div>
	);
}

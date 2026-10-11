'use client';

import { Building, Building2, CheckCircle2, Users } from 'lucide-react';
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

	return (
		<div className="space-y-6">
			{/* Tarjetas resumen de Departamentos */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
				<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Total Departamentos
						</span>
						<div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
							<Building className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
						{departamentos.length}
					</div>
					<p className="text-[11px] text-slate-400 mt-0.5">Áreas registradas</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Departamentos Activos
						</span>
						<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<CheckCircle2 className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
						{totalDeptosActivos}
					</div>
					<p className="text-[11px] text-emerald-600 mt-0.5">
						Operativos para requisiciones
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Departamentos Inactivos
						</span>
						<div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
							<Building2 className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
						{totalDeptosInactivos}
					</div>
					<p className="text-[11px] text-rose-600 mt-0.5">Deshabilitados</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500">
							Total Usuarios Asignados
						</span>
						<div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
							<Users className="w-4 h-4" />
						</div>
					</div>
					<div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
						{totalUsuarios}
					</div>
					<p className="text-[11px] text-purple-600 mt-0.5">
						Distribuidos en áreas
					</p>
				</div>
			</div>

			{/* Tabla CRUD de Departamentos */}
			<DepartamentosAdminTable departamentos={departamentos} />
		</div>
	);
}

'use client';

import { Users, UserCheck, UserX, Building } from 'lucide-react';
import type { UsuarioAdmin, DepartamentoAdmin } from '@/types/admin';
import { UsuariosAdminTable } from './UsuariosAdminTable';

interface UsuariosAdminTabProps {
	usuarios: UsuarioAdmin[];
	departamentos: DepartamentoAdmin[];
	currentUser: {
		usuario: string;
		rol: string;
	};
}

export function UsuariosAdminTab({
	usuarios,
	departamentos,
	currentUser,
}: UsuariosAdminTabProps) {
	const totalUsuariosActivos = usuarios.filter((u) => u.activo).length;
	const totalUsuariosInactivos = usuarios.filter((u) => !u.activo).length;

	return (
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
					<p className="text-[11px] text-emerald-600 mt-0.5">Con acceso al ERP</p>
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
					<p className="text-[11px] text-rose-600 mt-0.5">Cuentas suspendidas</p>
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
				departamentos={departamentos.filter((d) => d.activo)}
				currentUser={currentUser}
			/>
		</div>
	);
}

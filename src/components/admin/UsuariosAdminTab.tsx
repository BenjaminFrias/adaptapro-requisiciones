'use client';

import { cn } from '@/lib/utils';
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
	const contadores = {
		activos: usuarios.filter((u) => u.activo).length,
		inactivos: usuarios.filter((u) => !u.activo).length,
		solicitantes: usuarios.filter((u) => u.rol === 'SOLICITANTE').length,
		aprobadores: usuarios.filter((u) => u.rol === 'APROBADOR').length,
		compras: usuarios.filter((u) => u.rol === 'COMPRAS').length,
		administradores: usuarios.filter((u) => u.rol === 'ADMINISTRADOR').length,
	};

	// 4 KPIs de Alto Nivel
	const mainKpis = [
		{
			id: 'total-usuarios',
			titulo: 'Total usuarios',
			valor: usuarios.length,
			subtitulo: 'Registrados en el sistema',
			icon: Users,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'usuarios-activos',
			titulo: 'Usuarios activos',
			valor: contadores.activos,
			subtitulo: 'Con acceso al sistema',
			icon: UserCheck,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'usuarios-inactivos',
			titulo: 'Usuarios inactivos',
			valor: contadores.inactivos,
			subtitulo: 'Cuentas suspendidas',
			icon: UserX,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
		{
			id: 'departamentos-disponibles',
			titulo: 'Departamentos',
			valor: departamentos.length,
			subtitulo: 'Disponibles para asignación',
			icon: Building,
			iconColor:
				'bg-blue-50 dark:bg-blue-950/40 text-[#035786] dark:text-sky-400',
		},
	];

	// Tarjetas de desglose por Rol
	const roleKpis = [
		{
			id: 'solicitantes',
			label: 'Solicitantes',
			count: contadores.solicitantes,
			cardStyle:
				'bg-slate-100/70 dark:bg-zinc-800/50 border-slate-200/70 dark:border-zinc-700/60',
			textStyle: 'text-slate-600 dark:text-zinc-400',
		},
		{
			id: 'aprobadores',
			label: 'Aprobadores',
			count: contadores.aprobadores,
			cardStyle:
				'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40',
			textStyle: 'text-amber-800 dark:text-amber-300',
		},
		{
			id: 'compras',
			label: 'Compras',
			count: contadores.compras,
			cardStyle:
				'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40',
			textStyle: 'text-[#035786] dark:text-sky-300',
		},
		{
			id: 'administradores',
			label: 'Administradores',
			count: contadores.administradores,
			cardStyle:
				'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-800/40',
			textStyle: 'text-purple-800 dark:text-purple-300',
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

			{/* Tarjetas de recuento por Rol */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
				{roleKpis.map((item) => (
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

			{/* Tabla de Usuarios */}
			<UsuariosAdminTable
				usuarios={usuarios}
				departamentos={departamentos.filter((d) => d.activo)}
				currentUser={currentUser}
			/>
		</div>
	);
}

'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldAlert, FileText, Users, Building } from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import type { UsuarioAdmin, DepartamentoAdmin } from '@/types/admin';
import { RequisicionesAdminTab } from './RequisicionesAdminTab';
import { UsuariosAdminTab } from './UsuariosAdminTab';
import { DepartamentosAdminTab } from './DepartamentosAdminTab';

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
		departamentos: DepartamentoAdmin[];
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
	const [activeTab, setActiveTab] = useState<
		'requisiciones' | 'usuarios' | 'departamentos'
	>('requisiciones');

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
							Estadísticas consolidadas, auditoría de requisiciones y gestión
							integral de usuarios y departamentos.
						</p>
					</div>
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

					<button
						type="button"
						onClick={() => setActiveTab('departamentos')}
						className={`flex items-center gap-2 pb-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 transition-colors relative ${
							activeTab === 'departamentos'
								? 'border-[#301996] text-[#301996] dark:text-purple-400 dark:border-purple-400'
								: 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
						}`}
					>
						<Building className="w-4 h-4" />
						Departamentos
						<span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">
							{departamentos.length}
						</span>
					</button>
				</div>

				{/* Contenido Pestaña Requisiciones */}
				{activeTab === 'requisiciones' && (
					<RequisicionesAdminTab
						requisiciones={requisiciones}
						metricas={metricas}
					/>
				)}

				{/* Contenido Pestaña Usuarios */}
				{activeTab === 'usuarios' && (
					<UsuariosAdminTab
						usuarios={usuarios}
						departamentos={departamentos}
						currentUser={{
							usuario: user.usuario,
							rol: user.rol,
						}}
					/>
				)}

				{/* Contenido Pestaña Departamentos */}
				{activeTab === 'departamentos' && (
					<DepartamentosAdminTab
						departamentos={departamentos}
						totalUsuarios={usuarios.length}
					/>
				)}
			</main>
		</div>
	);
}

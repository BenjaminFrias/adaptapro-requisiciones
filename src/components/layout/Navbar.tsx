'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
	LogOut,
	FileText,
	CheckSquare,
	ShoppingBag,
	Settings,
	Building2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
}

export function Navbar({ user }: NavbarProps) {
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();

	const handleLogout = () => {
		startTransition(async () => {
			await logoutAction();
		});
	};

	// Iniciales del usuario
	const getInitials = (name: string) => {
		const parts = name.trim().split(' ');
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	};

	// Estilos del badge de rol
	const getRoleBadgeClass = (rol: string) => {
		switch (rol) {
			case 'ADMINISTRADOR':
				return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
			case 'APROBADOR':
				return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
			case 'COMPRAS':
				return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
			default:
				return 'bg-[#301996]/10 text-[#301996] border-[#301996]/20 dark:bg-[#301996]/25 dark:text-purple-300 dark:border-[#301996]/30';
		}
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#121214]/90 transition-all">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
				{/* Logo y Marca AdaptaPro */}
				<div className="flex items-center gap-7">
					<Link href="/dashboard" className="flex items-center gap-3 group">
						<div
							className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#301996]/25 group-hover:scale-105 transition-transform shrink-0"
							style={{
								background: 'linear-gradient(135deg, #301996 0%, #2563eb 100%)',
							}}
						>
							{/* Ícono de Estrella Geométrica AdaptaPro */}
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

						<div className="flex flex-col">
							<div className="flex items-center gap-1.5">
								<span className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
									AdaptaPro
								</span>
								<span className="text-[10px] font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/25 dark:text-purple-300">
									ERP
								</span>
							</div>
							<span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
								Gestión de Requisiciones
							</span>
						</div>
					</Link>

					{/* Menú de navegación principal */}
					<nav className="hidden md:flex items-center gap-1">
						<Link
							href="/dashboard"
							className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
								pathname === '/dashboard'
									? 'bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/20 dark:text-purple-300 shadow-xs'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
							}`}
						>
							<FileText className="w-3.5 h-3.5" />
							<span>Requisiciones</span>
						</Link>

						{user.rol === 'APROBADOR' && (
							<Link
								href="/aprobaciones"
								className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
									pathname === '/aprobaciones'
										? 'bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/20 dark:text-purple-300 shadow-xs'
										: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
								}`}
							>
								<CheckSquare className="w-3.5 h-3.5" />
								<span>Aprobaciones</span>
							</Link>
						)}

						{user.rol === 'COMPRAS' && (
							<Link
								href="/compras"
								className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
									pathname === '/compras'
										? 'bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/20 dark:text-purple-300 shadow-xs'
										: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
								}`}
							>
								<ShoppingBag className="w-3.5 h-3.5" />
								<span>Compras</span>
							</Link>
						)}

						{user.rol === 'ADMINISTRADOR' && (
							<Link
								href="/admin"
								className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
									pathname === '/admin'
										? 'bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/20 dark:text-purple-300 shadow-xs'
										: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
								}`}
							>
								<Settings className="w-3.5 h-3.5" />
								<span>Administración</span>
							</Link>
						)}
					</nav>
				</div>

				{/* Perfil del Usuario y Cerrar Sesión */}
				<div className="flex items-center gap-3 sm:gap-4">
					<div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-900/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800">
						{/* Avatar con iniciales */}
						<div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#301996] to-[#4f46e5] text-white flex items-center justify-center font-bold text-xs shadow-xs">
							{getInitials(user.nombre)}
						</div>

						{/* Información textual */}
						<div className="hidden sm:flex flex-col text-left">
							<div className="flex items-center gap-1.5">
								<span className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-36 truncate leading-tight">
									{user.nombre}
								</span>
								<span
									className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border ${getRoleBadgeClass(
										user.rol,
									)}`}
								>
									{user.rol}
								</span>
							</div>
							<div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
								<Building2 className="w-3 h-3 shrink-0" />
								<span className="truncate max-w-40">
									{user.departamentoNombre}
								</span>
							</div>
						</div>
					</div>

					{/* Botón Salir */}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						disabled={isPending}
						className="h-9 px-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/70 dark:hover:text-red-400 dark:hover:bg-red-950/30 text-xs gap-1.5 transition-colors"
						title="Cerrar Sesión"
					>
						<LogOut className="w-4 h-4" />
						<span className="hidden md:inline font-medium">Salir</span>
					</Button>
				</div>
			</div>
		</header>
	);
}

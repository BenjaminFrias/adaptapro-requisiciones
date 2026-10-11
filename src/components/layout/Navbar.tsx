'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
	LogOut,
	Building2,
	Search,
	Bell,
	ChevronDown,
	Menu,
	X,
	Sparkles,
	CheckCircle2,
	Clock,
	FileText,
	ShieldAlert,
	ShoppingBag,
	CheckSquare,
	KeyRound,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CambiarPasswordModal } from './CambiarPasswordModal';

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
	const router = useRouter();

	// Dropdowns and dialog states
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const profileRef = useRef<HTMLDivElement>(null);
	const notificationsRef = useRef<HTMLDivElement>(null);
	const searchModalRef = useRef<HTMLDivElement>(null);

	// Cerrar dropdowns al hacer clic afuera
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setIsProfileOpen(false);
			}
			if (
				notificationsRef.current &&
				!notificationsRef.current.contains(e.target as Node)
			) {
				setIsNotificationsOpen(false);
			}
			if (
				searchModalRef.current &&
				!searchModalRef.current.contains(e.target as Node)
			) {
				setIsSearchOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Atajos de teclado (Ctrl+K / Cmd+K para búsqueda, Esc para cerrar)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setIsSearchOpen((prev) => !prev);
			}
			if (e.key === 'Escape') {
				setIsSearchOpen(false);
				setIsProfileOpen(false);
				setIsNotificationsOpen(false);
				setIsMobileMenuOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const handleLogout = () => {
		startTransition(async () => {
			await logoutAction();
		});
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
			setIsSearchOpen(false);
		}
	};

	// Iniciales del usuario para el avatar
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

	// Enlaces de navegación permitidos exclusivamente según el rol del usuario
	const navItems = [
		{ name: 'Mis Requisiciones', href: '/dashboard', show: true },
		{
			name: 'Aprobaciones',
			href: '/aprobaciones',
			show: user.rol === 'APROBADOR',
		},
		{
			name: 'Compras',
			href: '/compras',
			show: user.rol === 'COMPRAS',
		},
		{
			name: 'Administración',
			href: '/admin',
			show: user.rol === 'ADMINISTRADOR',
		},
	].filter((item) => item.show);

	return (
		<>
			{/* Barra Superior Flotante Estilo Cápsula */}
			<header className="sticky top-0 z-40 w-full pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8 bg-transparent transition-all">
				<div className="max-w-7xl mx-auto w-full">
					<nav className="bg-white/95 dark:bg-[#16161a]/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 transition-all">
						{/* Logo y Marca AdaptaPro a la izquierda */}
						<div className="flex items-center gap-2 sm:gap-3 shrink-0">
							<Link
								href="/dashboard"
								className="flex items-center gap-2.5 sm:gap-3 group"
								aria-label="Ir al Inicio"
							>
								{/* Ícono circular distintivo con el color azul del logo y versión icono blanca */}
								<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#035786] flex items-center justify-center p-1.5 shadow-sm shadow-[#035786]/20 group-hover:scale-105 transition-transform shrink-0">
									<Image
										src="/brand/logo-icono-white.svg"
										alt="AdaptaPro Ícono"
										width={24}
										height={18}
										className="w-full h-auto object-contain"
										priority
									/>
								</div>

								{/* Versión completa del logo en azul */}
								<Image
									src="/brand/logo-full-blue.svg"
									alt="AdaptaPro"
									width={130}
									height={30}
									className="h-6 sm:h-7 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
									priority
								/>
							</Link>
						</div>

						{/* Navegación Central en Cápsula / Pill Segmented Control */}
						<div className="hidden md:flex items-center bg-slate-100/90 dark:bg-zinc-800/80 p-1 rounded-full border border-slate-200/50 dark:border-zinc-700/50 shadow-inner">
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== '/dashboard' && pathname.startsWith(item.href));
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
											isActive
												? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold shadow-xs'
												: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-700/60'
										}`}
									>
										{item.name}
									</Link>
								);
							})}
						</div>

						{/* Acciones a la Derecha: Búsqueda, Notificaciones y Perfil */}
						<div className="flex items-center gap-1.5 sm:gap-2">
							{/* Botón de Búsqueda */}
							<button
								onClick={() => setIsSearchOpen(true)}
								className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
								title="Buscar requisición (Ctrl+K)"
								aria-label="Buscar"
							>
								<Search className="w-4 h-4" />
							</button>

							{/* Botón de Notificaciones con Popover */}
							<div className="relative" ref={notificationsRef}>
								<button
									onClick={() => setIsNotificationsOpen((prev) => !prev)}
									className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors relative cursor-pointer"
									title="Notificaciones del sistema"
									aria-label="Notificaciones"
								>
									<Bell className="w-4 h-4" />
									<span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
								</button>

								{/* Menú de Notificaciones */}
								{isNotificationsOpen && (
									<div className="absolute right-0 mt-3 w-80 sm:w-88 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-4 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
										<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-slate-900 dark:text-white">
													Notificaciones
												</span>
												<span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
													2 nuevas
												</span>
											</div>
											<span className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
												Marcar leídas
											</span>
										</div>

										<div className="space-y-2.5 pt-3">
											<div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left cursor-pointer">
												<div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
													<CheckCircle2 className="w-4 h-4" />
												</div>
												<div className="space-y-0.5 min-w-0">
													<p className="text-xs font-medium text-slate-800 dark:text-slate-200">
														Requisición Aprobada
													</p>
													<p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
														REQ-2026-004 ha sido aprobada por Dirección.
													</p>
													<span className="text-[10px] text-slate-400">
														Hace 15 min
													</span>
												</div>
											</div>

											<div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left cursor-pointer">
												<div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
													<Clock className="w-4 h-4" />
												</div>
												<div className="space-y-0.5 min-w-0">
													<p className="text-xs font-medium text-slate-800 dark:text-slate-200">
														Pendiente de cotización
													</p>
													<p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
														REQ-2026-003 en proceso en departamento de Compras.
													</p>
													<span className="text-[10px] text-slate-400">
														Hace 1 hora
													</span>
												</div>
											</div>
										</div>

										<div className="pt-3 mt-1 border-t border-slate-100 dark:border-zinc-800 text-center">
											<Link
												href="/dashboard"
												onClick={() => setIsNotificationsOpen(false)}
												className="text-xs text-[#301996] dark:text-blue-400 font-semibold hover:underline"
											>
												Ver todas las solicitudes
											</Link>
										</div>
									</div>
								)}
							</div>

							{/* Perfil del Usuario con Avatar Circular y Dropdown */}
							<div className="relative" ref={profileRef}>
								<button
									onClick={() => setIsProfileOpen((prev) => !prev)}
									className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
									aria-label="Menú de perfil"
								>
									{/* Avatar circular con gradiente corporativo */}
									<div
										className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ring-2 ring-slate-100 dark:ring-zinc-800 shrink-0"
										style={{
											background:
												'linear-gradient(135deg, #301996 0%, #2563eb 60%, #38bdf8 100%)',
										}}
									>
										{getInitials(user.nombre)}
									</div>
									<ChevronDown
										className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
											isProfileOpen ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{/* Dropdown de Perfil de Usuario */}
								{isProfileOpen && (
									<div className="absolute right-0 mt-3 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-4 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
										{/* Encabezado del perfil */}
										<div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
											<div
												className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
												style={{
													background:
														'linear-gradient(135deg, #301996 0%, #2563eb 60%, #38bdf8 100%)',
												}}
											>
												{getInitials(user.nombre)}
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
													{user.nombre}
												</h4>
												<p className="text-xs text-slate-400 truncate">
													@{user.usuario}
												</p>
												<div className="flex items-center gap-1.5 mt-1.5">
													<span
														className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
															user.rol,
														)}`}
													>
														{user.rol}
													</span>
												</div>
											</div>
										</div>

										{/* Información de Departamento */}
										<div className="py-2.5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
											<Building2 className="w-4 h-4 text-slate-400 shrink-0" />
											<span className="truncate">{user.departamentoNombre}</span>
										</div>

										{/* Accesos rápidos de rol */}
										<div className="py-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
											<Link
												href="/dashboard"
												onClick={() => setIsProfileOpen(false)}
												className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
											>
												<FileText className="w-3.5 h-3.5 text-slate-400" />
												<span>Mis Requisiciones</span>
											</Link>

											{user.rol === 'APROBADOR' && (
												<Link
													href="/aprobaciones"
													onClick={() => setIsProfileOpen(false)}
													className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
												>
													<CheckSquare className="w-3.5 h-3.5 text-amber-500" />
													<span>Bandeja de Aprobaciones</span>
												</Link>
											)}

											{user.rol === 'COMPRAS' && (
												<Link
													href="/compras"
													onClick={() => setIsProfileOpen(false)}
													className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
												>
													<ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
													<span>Gestión de Compras</span>
												</Link>
											)}

											{user.rol === 'ADMINISTRADOR' && (
												<Link
													href="/admin"
													onClick={() => setIsProfileOpen(false)}
													className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
												>
													<ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
													<span>Panel de Administración</span>
												</Link>
											)}
										</div>

										{/* Seguridad / Cambiar Contraseña */}
										<div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
											<button
												type="button"
												onClick={() => {
													setIsProfileOpen(false);
													setIsChangePasswordOpen(true);
												}}
												className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
											>
												<KeyRound className="w-3.5 h-3.5 text-[#301996] dark:text-blue-400" />
												<span>Cambiar Contraseña</span>
											</button>
										</div>

										{/* Botón Salir / Logout */}
										<div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
											<Button
												variant="ghost"
												size="sm"
												onClick={handleLogout}
												disabled={isPending}
												className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl h-8.5 gap-2"
											>
												<LogOut className="w-3.5 h-3.5" />
												<span>Cerrar Sesión</span>
											</Button>
										</div>
									</div>
								)}
							</div>

							{/* Botón Menú Móvil */}
							<button
								onClick={() => setIsMobileMenuOpen((prev) => !prev)}
								className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ml-1"
								aria-label="Abrir navegación móvil"
							>
								{isMobileMenuOpen ? (
									<X className="w-4 h-4" />
								) : (
									<Menu className="w-4 h-4" />
								)}
							</button>
						</div>
					</nav>

					{/* Menú Desplegable Móvil */}
					{isMobileMenuOpen && (
						<div className="md:hidden mt-2 bg-white/95 dark:bg-[#16161a]/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-lg p-3 space-y-1 animate-in fade-in-0 duration-150">
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== '/dashboard' && pathname.startsWith(item.href));
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`block px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
											isActive
												? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
												: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800'
										}`}
									>
										{item.name}
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</header>

			{/* Modal de Búsqueda Rápida (Estilo Command Palette) */}
			{isSearchOpen && (
				<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in-0 duration-150">
					<div
						ref={searchModalRef}
						className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
					>
						<form onSubmit={handleSearchSubmit} className="relative">
							<div className="flex items-center px-4 border-b border-slate-100 dark:border-zinc-800">
								<Search className="w-4 h-4 text-slate-400 shrink-0" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Buscar requisición por código, motivo o proveedor..."
									autoFocus
									className="w-full py-3.5 px-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
								/>
								<button
									type="button"
									onClick={() => setIsSearchOpen(false)}
									className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700"
								>
									ESC
								</button>
							</div>
						</form>

						<div className="p-3 text-xs text-slate-400 flex items-center justify-between">
							<span className="flex items-center gap-1.5">
								<Sparkles className="w-3.5 h-3.5 text-[#301996] dark:text-blue-400" />
								Presiona Enter para filtrar en el Dashboard
							</span>
							<span className="text-[11px] font-mono">AdaptaPro Search</span>
						</div>
					</div>
				</div>
			)}

			{/* Modal de Cambio de Contraseña */}
			<CambiarPasswordModal
				isOpen={isChangePasswordOpen}
				onClose={() => setIsChangePasswordOpen(false)}
			/>
		</>
	);
}

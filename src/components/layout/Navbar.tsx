'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
	LogOut,
	Building2,
	Search,
	ChevronDown,
	Menu,
	X,
	KeyRound,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CambiarPasswordModal } from './CambiarPasswordModal';
import { NotificationDropdown } from './NotificationDropdown';

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
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const profileRef = useRef<HTMLDivElement>(null);
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
				return 'bg-[#035786]/10 text-[#035786] border-[#035786]/20 dark:bg-[#035786]/25 dark:text-blue-300 dark:border-[#035786]/30';
		}
	};

	// Enlaces de navegación permitidos exclusivamente según el rol del usuario
	const navItems = [
		{ name: 'Mis Requisiciones', href: '/dashboard', show: true },
		{
			name: 'Aprobaciones',
			href: '/aprobaciones',
			show: user.rol === 'APROBADOR' || user.rol === 'ADMINISTRADOR',
		},
		{
			name: 'Compras',
			href: '/compras',
			show: user.rol === 'COMPRAS' || user.rol === 'ADMINISTRADOR',
		},
		{
			name: 'Administración',
			href: '/admin',
			show: user.rol === 'ADMINISTRADOR',
		},
	].filter((item) => item.show);

	return (
		<>
			{/* Barra Superior Sólida de Extremo a Extremo */}
			<header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md transition-all">
				<div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
					<nav className="h-14 sm:h-16 flex items-center justify-between gap-4">
						{/* Logo y Marca AdaptaPro a la izquierda */}
						<div className="flex items-center gap-3 shrink-0">
							<Link
								href="/dashboard"
								className="flex items-center gap-2.5 sm:gap-3 group"
								aria-label="Ir al Inicio"
							>
								{/* Ícono con el color azul corporativo #035786 */}
								<div className="w-8 h-8 rounded-md bg-[#035786] flex items-center justify-center p-1.5 transition-opacity group-hover:opacity-90 shrink-0">
									<Image
										src="/brand/logo-icono-white.svg"
										alt="AdaptaPro Ícono"
										width={22}
										height={18}
										className="w-full h-auto object-contain"
										priority
									/>
								</div>

								{/* Versión completa del logo en azul */}
								<Image
									src="/brand/logo-full-blue.svg"
									alt="AdaptaPro"
									width={125}
									height={28}
									className="h-6 sm:h-6.5 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
									priority
								/>
							</Link>
						</div>

						{/* Navegación Central Horizontal Limpia */}
						<div className="hidden md:flex items-center gap-1">
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== '/dashboard' &&
										pathname.startsWith(item.href));
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
											isActive
												? 'text-[#035786] dark:text-blue-400 font-semibold'
												: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60 font-medium'
										}`}
									>
										{item.name}
										{isActive && (
											<span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#035786] dark:bg-blue-400 rounded-full" />
										)}
									</Link>
								);
							})}
						</div>

						{/* Acciones a la Derecha: Búsqueda, Notificaciones y Perfil */}
						<div className="flex items-center gap-1.5 sm:gap-2">
							{/* Botón de Búsqueda */}
							<button
								onClick={() => setIsSearchOpen(true)}
								className="h-9 px-3.5 rounded-md flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:text-white bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-xs font-medium"
								title="Buscar requisición"
								aria-label="Buscar"
							>
								<Search className="w-4 h-4" />
								<span className="hidden lg:inline text-slate-400">
									Buscar...
								</span>
							</button>

							{/* Componente Modular de Notificaciones */}
							<NotificationDropdown />

							{/* Perfil del Usuario con Avatar y Dropdown */}
							<div className="relative" ref={profileRef}>
								<button
									onClick={() => setIsProfileOpen((prev) => !prev)}
									className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
									aria-label="Menú de perfil"
								>
									{/* Avatar con azul corporativo plano */}
									<div className="w-8 h-8 rounded-md bg-[#035786] flex items-center justify-center font-semibold text-xs text-white shrink-0">
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
									<div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-md border border-slate-200/80 dark:border-zinc-800 p-4 z-50 animate-in fade-in-0 duration-150">
										{/* Encabezado del perfil */}
										<div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
											<div className="w-10 h-10 rounded-md bg-[#035786] flex items-center justify-center font-semibold text-sm text-white shrink-0">
												{getInitials(user.nombre)}
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
													{user.nombre}
												</h4>
												<p className="text-xs text-slate-400 truncate">
													@{user.usuario}
												</p>
												<div className="flex items-center gap-1.5 mt-1.5">
													<span
														className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md border ${getRoleBadgeClass(
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
											<span className="truncate">
												{user.departamentoNombre}
											</span>
										</div>

										{/* Seguridad / Cambiar Contraseña */}
										<div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
											<button
												type="button"
												onClick={() => {
													setIsProfileOpen(false);
													setIsChangePasswordOpen(true);
												}}
												className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
											>
												<KeyRound className="w-3.5 h-3.5 text-[#035786] dark:text-blue-400" />
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
												className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md h-8.5 gap-2"
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
								className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ml-1"
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
						<div className="md:hidden py-2 border-t border-slate-100 dark:border-zinc-800 space-y-1 animate-in fade-in-0 duration-150">
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== '/dashboard' &&
										pathname.startsWith(item.href));
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`block px-3 py-2 rounded-md text-sm transition-colors ${
											isActive
												? 'text-[#035786] dark:text-blue-400 font-semibold'
												: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800 font-medium'
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
						className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 overflow-hidden"
					>
						<form onSubmit={handleSearchSubmit} className="relative">
							<div className="flex items-center px-4 border-b border-slate-100 dark:border-zinc-800">
								<Search className="w-4 h-4 text-slate-400 shrink-0" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Buscar requisición por código o proveedor..."
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
								Presiona Enter para filtrar en el Dashboard
							</span>
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

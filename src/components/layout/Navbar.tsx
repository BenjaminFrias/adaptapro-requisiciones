'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';
import { NavbarSearch } from './NavbarSearch';
import { UserProfileDropdown } from './UserProfileDropdown';

interface NavbarProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
}

export function Navbar({ user }: NavbarProps) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Cerrar menú móvil con Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsMobileMenuOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

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
							{/* Componente Modular de Búsqueda Rápida */}
							<NavbarSearch />

							{/* Componente Modular de Notificaciones */}
							<NotificationDropdown />

							{/* Perfil del Usuario con Avatar y Dropdown */}
							{/* Perfil del Usuario Modular y Minimalista */}
							<UserProfileDropdown user={user} />

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



		</>
	);
}

'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { logoutAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { CambiarPasswordModal } from './CambiarPasswordModal';

interface UserProfileDropdownProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cerrar al hacer clic fuera del menú
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Cerrar con Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	const handleLogout = () => {
		startTransition(async () => {
			await logoutAction();
		});
	};

	// Iniciales del usuario para el avatar
	const getInitials = (name: string) => {
		const parts = name.trim().split(' ');
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	};

	// Formato de rol limpio y legible
	const getRoleLabel = (rol: string) => {
		switch (rol) {
			case 'ADMINISTRADOR':
				return 'Administrador';
			case 'APROBADOR':
				return 'Aprobador';
			case 'COMPRAS':
				return 'Compras';
			default:
				return 'Solicitante';
		}
	};

	return (
		<>
			<div className="relative" ref={dropdownRef}>
				{/* Botón disparador con Button component */}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setIsOpen((prev) => !prev)}
					className="h-9 px-1.5 gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800/80 rounded-md cursor-pointer group"
					aria-label="Menú de perfil"
					aria-expanded={isOpen}
				>
					{/* Avatar circular limpio */}
					<div className="w-7 h-7 rounded-full bg-[#035786] flex items-center justify-center font-medium text-xs text-white shrink-0 select-none">
						{getInitials(user.nombre)}
					</div>
					<ChevronDown
						className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-150 ${
							isOpen ? 'rotate-180' : ''
						}`}
					/>
				</Button>

				{/* Menú desplegable sobrio y minimalista */}
				{isOpen && (
					<div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/90 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in-0 duration-100">
						{/* Información del usuario */}
						<div className="px-2.5 py-2">
							<p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
								{user.nombre}
							</p>
							<p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
								@{user.usuario} · {user.departamentoNombre}
							</p>
							<div className="mt-1.5">
								<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60">
									{getRoleLabel(user.rol)}
								</span>
							</div>
						</div>

						{/* Separador sutil */}
						<div className="h-px bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800 my-1" />

						{/* Acción: Cambiar contraseña */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsOpen(false);
								setIsChangePasswordOpen(true);
							}}
							className="w-full justify-start h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 gap-2.5 rounded-md cursor-pointer"
						>
							<KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
							<span>Cambiar contraseña</span>
						</Button>

						{/* Separador antes de acción destructiva */}
						<div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />

						{/* Acción: Cerrar sesión */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleLogout}
							disabled={isPending}
							className="w-full justify-start h-8 px-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 gap-2.5 rounded-md cursor-pointer disabled:opacity-50"
						>
							<LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
							<span>{isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
						</Button>
					</div>
				)}
			</div>

			{/* Modal de cambio de contraseña */}
			<CambiarPasswordModal
				isOpen={isChangePasswordOpen}
				onClose={() => setIsChangePasswordOpen(false)}
			/>
		</>
	);
}

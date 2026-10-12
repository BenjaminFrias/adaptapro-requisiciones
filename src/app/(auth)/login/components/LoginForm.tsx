'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from 'cn';
import { AlertCircle, Loader2, Eye, EyeOff, Users, ChevronDown } from 'lucide-react';

const QUICK_USERS = [
	{ usuario: 'admin', nombre: 'Admin' },
	{ usuario: 'solicitante', nombre: 'Juan Perez' },
	{ usuario: 'solicitante_ti', nombre: 'Ana Gomez' },
	{ usuario: 'aprobador', nombre: 'María' },
	{ usuario: 'compras', nombre: 'Carlos' },
	{ usuario: 'inactivo', nombre: 'Pedro (Inactivo)' },
];

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loadingQuickUser, setLoadingQuickUser] = useState<string | null>(null);
	const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
	const quickMenuRef = useRef<HTMLDivElement>(null);

	// Cerrar menú al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				quickMenuRef.current &&
				!quickMenuRef.current.contains(e.target as Node)
			) {
				setIsQuickMenuOpen(false);
			}
		};

		if (isQuickMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isQuickMenuOpen]);

	// Cerrar menú con tecla Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isQuickMenuOpen) {
				setIsQuickMenuOpen(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isQuickMenuOpen]);

	const {
		register,
		handleSubmit,
		setValue,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			usuario: '',
			password: '',
		},
		mode: 'onSubmit',
		reValidateMode: 'onChange',
	});

	const onSubmit = async (data: LoginInput) => {
		setError(null);

		try {
			const formData = new FormData();
			formData.append('usuario', data.usuario);
			formData.append('password', data.password);

			const res = await loginAction(formData);
			if (res && !res.success) {
				setError(res.error || 'Ocurrió un error al ingresar');
			}
		} catch {
			// Next.js redirection trigger en Server Action
		}
	};

	const fillQuickUser = async (user: string) => {
		if (isSubmitting || loadingQuickUser) return;
		setValue('usuario', user, { shouldValidate: true });
		setValue('password', 'password123', { shouldValidate: true });
		clearErrors();
		setError(null);
		setLoadingQuickUser(user);

		try {
			const formData = new FormData();
			formData.append('usuario', user);
			formData.append('password', 'password123');

			const res = await loginAction(formData);
			if (res && !res.success) {
				setError(res.error || 'Ocurrió un error al ingresar');
			}
		} catch {
			// Next.js redirection trigger en Server Action
		} finally {
			setLoadingQuickUser(null);
		}
	};

	const isProcessing = isSubmitting || !!loadingQuickUser;

	return (
		<div className="w-full lg:w-1/2 flex flex-col justify-between items-center px-6 py-8 sm:px-12 lg:px-14 xl:px-18 lg:h-full overflow-y-auto">
			<div className="w-full max-w-105 my-auto">
				{/* Encabezado del Formulario con ritmo y espaciado generoso */}
				<div className="mb-7 sm:mb-8 space-y-1.5">
					<h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
						Iniciar sesión
					</h1>
					<p className="text-sm text-slate-500 dark:text-zinc-400 leading-normal">
						Ingresa tus credenciales para acceder a tus solicitudes
					</p>
				</div>

				{/* Mensaje de Error */}
				{error && (
					<div
						role="alert"
						className="mb-5 flex items-start gap-2.5 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 animate-in fade-in-50 duration-200"
					>
						<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				)}

				{/* Formulario con espaciado natural */}
				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="space-y-4 sm:space-y-4.5"
				>
					<div className="space-y-1.5">
						<Label
							htmlFor="usuario"
							className="text-sm font-medium text-[#1e293b] dark:text-zinc-200"
						>
							Usuario o correo electrónico
						</Label>
						<div className="relative">
							<Input
								id="usuario"
								type="text"
								autoComplete="username"
								placeholder="ej. jperez o jperez@adaptapro.com"
								disabled={isProcessing}
								aria-invalid={!!errors.usuario}
								{...register('usuario')}
								className={cn(errors.usuario && 'pr-10')}
							/>
							{errors.usuario && (
								<div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
									<AlertCircle className="h-4.5 w-4.5 fill-red-500 text-white" />
								</div>
							)}
						</div>
						{errors.usuario && (
							<p className="text-xs text-red-600 dark:text-red-400 mt-1 animate-in fade-in-50 duration-200">
								{errors.usuario.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="password"
							className="text-sm font-medium text-[#1e293b] dark:text-zinc-200"
						>
							Contraseña
						</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								autoComplete="current-password"
								placeholder="Ingresa tu contraseña"
								disabled={isProcessing}
								aria-invalid={!!errors.password}
								{...register('password')}
								className={cn('pr-10', errors.password && 'pr-16')}
							/>
							<div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
								{errors.password && (
									<AlertCircle className="h-4.5 w-4.5 fill-red-500 text-white pointer-events-none shrink-0" />
								)}
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={
										showPassword ? 'Ocultar contraseña' : 'Ver contraseña'
									}
									className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 focus:outline-none"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
						{errors.password && (
							<p className="text-xs text-red-600 dark:text-red-400 mt-1 animate-in fade-in-50 duration-200">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button
						type="submit"
						size="lg"
						className="w-full mt-2"
						disabled={isProcessing}
					>
						{isProcessing ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Ingresando...
							</>
						) : (
							'Ingresar al sistema'
						)}
					</Button>
				</form>

				{/* Acceso Rápido de Prueba (Popup) */}
				<div className="relative pt-1" ref={quickMenuRef}>
					<div className="relative my-4 xl:my-5">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-slate-200 dark:border-zinc-800" />
						</div>
						<div className="relative flex justify-center text-[11px] uppercase">
							<span className="bg-[#faf9f5] dark:bg-[#121214] px-3 text-slate-400 font-medium tracking-wider">
								Acceso Rápido
							</span>
						</div>
					</div>

					{/* Botón único para abrir popup */}
					<button
						type="button"
						disabled={isProcessing}
						onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
						className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#035786]/50 dark:hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/60 bg-white dark:bg-zinc-900 transition-all text-xs font-medium text-slate-700 dark:text-zinc-200 flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
					>
						<span className="flex items-center gap-2">
							<Users className="w-3.5 h-3.5 text-slate-400" />
							<span>
								{loadingQuickUser
									? `Ingresando como ${QUICK_USERS.find((u) => u.usuario === loadingQuickUser)?.nombre}...`
									: 'Seleccionar usuario de prueba'}
							</span>
						</span>
						{loadingQuickUser ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin text-[#035786] dark:text-sky-400 shrink-0" />
						) : (
							<ChevronDown
								className={cn(
									'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0',
									isQuickMenuOpen && 'rotate-180',
								)}
							/>
						)}
					</button>

					{/* Menú Popup con la lista sencilla de usuarios */}
					{isQuickMenuOpen && (
						<div className="absolute left-0 right-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 z-30 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg p-1 animate-in fade-in-50 zoom-in-95 duration-150">
							<div className="space-y-0.5">
								{QUICK_USERS.map((qu) => (
									<button
										key={qu.usuario}
										type="button"
										disabled={isProcessing}
										onClick={() => {
											setIsQuickMenuOpen(false);
											fillQuickUser(qu.usuario);
										}}
										className="w-full px-3 py-2 text-xs font-medium rounded text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#035786] dark:hover:text-sky-400 transition-colors text-left flex items-center justify-between cursor-pointer"
									>
										<span>{qu.nombre}</span>
									</button>
								))}
							</div>
						</div>
					)}

					<p className="text-[11px] text-slate-400 text-center mt-2.5">
						Clave predeterminada:{' '}
						<code className="font-mono text-slate-500 dark:text-slate-400 font-medium">
							password123
						</code>
					</p>
				</div>
			</div>

			{/* Footer Mínimo */}
			<footer className="w-full pt-4 pb-2 text-center text-xs text-slate-400 dark:text-zinc-500 select-none">
				<p>© {new Date().getFullYear()} AdaptaPro ERP. Todos los derechos reservados.</p>
			</footer>
		</div>
	);
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
	const [usuario, setUsuario] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append('usuario', usuario);
			formData.append('password', password);

			const res = await loginAction(formData);
			if (res && !res.success) {
				setError(res.error || 'Ocurrió un error al ingresar');
			}
		} catch {
			// Next.js redirection trigger en Server Action
		} finally {
			setLoading(false);
		}
	};

	const fillQuickUser = (user: string) => {
		setUsuario(user);
		setPassword('password123');
		setError(null);
	};

	return (
		<div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-white dark:bg-[#121214] flex flex-col lg:flex-row p-3 sm:p-4 lg:p-5 xl:p-6 gap-4 lg:gap-6 xl:gap-8 box-border">
			{/* Lado Izquierdo: Tarjeta grande con gradiente de pantalla completa */}
			<div
				className="relative w-full lg:w-[48%] xl:w-[46%] rounded-[24px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between min-h-90 lg:h-full text-white shadow-xl shrink-0"
				style={{
					background: `
            radial-gradient(circle at 12% 16%, #035786 0%, transparent 42%),
            radial-gradient(circle at 85% 20%, #035786 0%, transparent 45%),
            radial-gradient(circle at 80% 82%, #7096c2 0%, transparent 45%),
            radial-gradient(circle at 25% 78%, #031726 0%, transparent 60%),
            linear-gradient(140deg, #0284c7 0%, #035786 46%, #02121e 100%)
          `,
				}}
			>
				{/* Sutil overlay de textura */}
				<div
					className="absolute inset-0 bg-white/3 backdrop-blur-[1px] pointer-events-none"
					aria-hidden="true"
				/>

				{/* Logo AdaptaPro en la parte superior izquierda */}
				<div className="relative z-10 flex items-center justify-start">
					<Image
						src="/brand/logo-full-white.svg"
						alt="AdaptaPro"
						width={220}
						height={50}
						className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
						priority
					/>
				</div>

				{/* Título y descripción en la parte inferior */}
				<div className="relative z-10 space-y-2 sm:space-y-3 pt-6">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
						Sistema de Requisiciones
					</h2>
					<p className="text-xs sm:text-sm text-white/85 max-w-md leading-relaxed font-normal">
						Accede a tu plataforma para gestionar solicitudes, aprobaciones y
						compras con claridad y productividad en un solo lugar.
					</p>
				</div>
			</div>

			{/* Lado Derecho: Formulario de Login ocupando la totalidad del espacio restante */}
			<div className="flex-1 flex flex-col justify-center items-center px-4 py-3 sm:px-8 lg:px-10 lg:h-full overflow-y-auto lg:overflow-y-visible">
				<div className="w-full max-w-105 space-y-4 xl:space-y-5 my-auto">
					{/* Encabezado del Formulario */}
					<div className="space-y-1">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
							Iniciar Sesión
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
							Ingresa tus credenciales para acceder a tus solicitudes
						</p>
					</div>

					{/* Mensaje de Error */}
					{error && (
						<div
							role="alert"
							className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 animate-in fade-in-50 duration-200"
						>
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* Formulario */}
					<form onSubmit={handleSubmit} className="space-y-3.5 xl:space-y-4">
						<div className="space-y-1.5">
							<Label
								htmlFor="usuario"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide"
							>
								Usuario o Correo
							</Label>
							<Input
								id="usuario"
								name="usuario"
								type="text"
								autoComplete="username"
								placeholder="ej. solicitante o tu@correo.com"
								value={usuario}
								onChange={(e) => setUsuario(e.target.value)}
								disabled={loading}
								required
								className="h-10.5 sm:h-11 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 px-3.5 text-sm focus-visible:ring-[#301996]/20 focus-visible:border-[#301996] transition-all"
							/>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="password"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide"
							>
								Contraseña
							</Label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
									required
									className="h-10.5 sm:h-11 rounded-xl bg-slate-50/70 dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 pl-3.5 pr-10 text-sm focus-visible:ring-[#301996]/20 focus-visible:border-[#301996] transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={
										showPassword ? 'Ocultar contraseña' : 'Ver contraseña'
									}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 focus:outline-none"
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

						<Button
							type="submit"
							className="w-full h-10.5 sm:h-11 rounded-xl bg-[#301996] hover:bg-[#26137a] text-white font-medium text-sm sm:text-base shadow-md shadow-[#301996]/25 hover:shadow-lg hover:shadow-[#301996]/35 active:scale-[0.99] transition-all mt-1"
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Ingresando...
								</>
							) : (
								'Ingresar al Sistema'
							)}
						</Button>
					</form>

					{/* Acceso Rápido de Prueba (Demo) */}
					<div className="pt-1">
						<div className="relative my-4 xl:my-5">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-slate-200 dark:border-zinc-800" />
							</div>
							<div className="relative flex justify-center text-[11px] uppercase">
								<span className="bg-white dark:bg-[#121214] px-3 text-slate-400 font-medium tracking-wider">
									Acceso Rápido de Prueba
								</span>
							</div>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7.5 sm:h-8 rounded-lg text-xs font-medium border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
								onClick={() => fillQuickUser('solicitante')}
							>
								Solicitante
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7.5 sm:h-8 rounded-lg text-xs font-medium border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
								onClick={() => fillQuickUser('aprobador')}
							>
								Aprobador
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7.5 sm:h-8 rounded-lg text-xs font-medium border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
								onClick={() => fillQuickUser('compras')}
							>
								Compras
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7.5 sm:h-8 rounded-lg text-xs font-medium border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
								onClick={() => fillQuickUser('admin')}
							>
								Admin
							</Button>
						</div>

						<p className="text-[11px] text-slate-400 text-center mt-2.5">
							Clave predeterminada:{' '}
							<code className="font-mono text-slate-500 dark:text-slate-400 font-medium">
								password123
							</code>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

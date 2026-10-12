import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export function AuthBrandShowcase() {
	return (
		<div
			className="relative w-full lg:w-1/2 p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between min-h-130 lg:h-full text-white shrink-0"
			style={{
				background: 'linear-gradient(180deg, #035786 0%, #02456b 100%)',
			}}
		>
			{/* Sutil Grid de fondo técnico con gradiente de desvanecimiento */}
			<div
				className="absolute inset-0 opacity-[0.07] pointer-events-none"
				style={{
					backgroundImage: `
						linear-gradient(to right, #ffffff 1px, transparent 1px),
						linear-gradient(to bottom, #ffffff 1px, transparent 1px)
					`,
					backgroundSize: '28px 28px',
					maskImage:
						'radial-gradient(ellipse at center, black 40%, transparent 90%)',
					WebkitMaskImage:
						'radial-gradient(ellipse at center, black 40%, transparent 90%)',
				}}
				aria-hidden="true"
			/>

			{/* Logo AdaptaPro pequeño en la parte superior izquierda */}
			<div className="relative z-10 flex items-center justify-center">
				<Image
					src="/brand/logo-full-white.svg"
					alt="AdaptaPro"
					width={140}
					height={32}
					className="h-6 sm:h-7 w-auto object-contain opacity-95"
					priority
				/>
			</div>

			{/* Mockup Central: Requisiciones minimalistas flotantes (inspirado en Overpay/Stripe) */}
			<div className="relative z-10 my-auto py-6 sm:py-8 flex flex-col items-center justify-center">
				<div className="relative w-full max-w-85 sm:max-w-90">
					{/* Tarjeta de Requisición 1 (Fondo / Principal) */}
					<div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-md p-4 sm:p-4.5 text-slate-800 dark:text-zinc-100 border border-white/20">
						<div className="flex items-center justify-between gap-3 mb-2.5">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 flex items-center justify-center shrink-0">
									<CheckCircle2 className="w-3.5 h-3.5" />
								</div>
								<div>
									<h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight">
										Servidores Cloud AWS
									</h4>
								</div>
							</div>
							<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md shrink-0">
								<CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
								Aprobada
							</span>
						</div>

						<div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400">
							<span>Departamento TI</span>
							<span className="font-semibold text-slate-700 dark:text-zinc-200">
								$ 2,450.00
							</span>
						</div>
					</div>

					{/* Tarjeta de Requisición 2 (Superpuesta / Minimalista compacta) */}
					<div className="mt-2.5 ml-auto w-[90%] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-md p-3 sm:p-3.5 text-slate-800 dark:text-zinc-100 border border-white/25">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
									<CheckCircle2 className="w-3.5 h-3.5" />
								</div>
								<div className="truncate">
									<span className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate block">
										Licencias Figma Team
									</span>
								</div>
							</div>
							<span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md shrink-0">
								Aprobada
							</span>
						</div>
					</div>

					{/* Tarjeta de Requisición 3 (Efecto de desvanecimiento / Desapareciendo) */}
					<div
						className="mt-2.5 ml-auto w-[80%] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs rounded-md p-2.5 sm:p-3 text-slate-800/60 dark:text-zinc-100/60 border border-white/10 opacity-70 scale-[0.97] origin-top-right pointer-events-none select-none"
						style={{
							maskImage:
								'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 90%)',
							WebkitMaskImage:
								'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 90%)',
						}}
						aria-hidden="true"
					>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<div className="w-5.5 h-5.5 rounded-md bg-emerald-50/70 text-emerald-600/70 flex items-center justify-center shrink-0">
									<CheckCircle2 className="w-3 h-3" />
								</div>
								<div className="truncate">
									<span className="text-[11px] font-medium text-slate-800/80 dark:text-zinc-200/80 truncate block">
										Renovación SSL Wildcard
									</span>
								</div>
							</div>
							<span className="text-[9px] font-semibold text-emerald-600/80 bg-emerald-50/60 px-1.5 py-0.5 rounded-md shrink-0">
								Aprobada
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Título y subtítulo centrado en la parte inferior */}
			<div className="relative z-10 text-center space-y-2 pt-4">
				<h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
					Sistema de Requisiciones
				</h2>
				<p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto leading-relaxed font-normal">
					Gestiona solicitudes, aprobaciones y compras de tu empresa con
					claridad y rapidez en un solo lugar.
				</p>
			</div>
		</div>
	);
}

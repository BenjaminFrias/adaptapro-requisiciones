import { getEstadoLabel } from '@/constants/requisicion';

export function EstadoBadge({ estado }: { estado: string }) {
	const label = getEstadoLabel(estado);

	switch (estado) {
		case 'BORRADOR':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
					<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
					{label}
				</span>
			);
		case 'PENDIENTE_APROBACION':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
					{label}
				</span>
			);
		case 'APROBADA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
					{label}
				</span>
			);
		case 'DEVUELTA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800">
					<span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
					{label}
				</span>
			);
		case 'RECHAZADA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
					<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
					{label}
				</span>
			);
		case 'EN_COMPRA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
					<span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
					{label}
				</span>
			);
		case 'ATENDIDA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#301996]/10 text-[#301996] border border-[#301996]/20 dark:bg-[#301996]/30 dark:text-purple-300 dark:border-[#301996]/40">
					<span className="w-1.5 h-1.5 rounded-full bg-[#301996]" />
					{label}
				</span>
			);
		case 'CANCELADA':
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200 line-through dark:bg-zinc-800/50 dark:text-zinc-500 dark:border-zinc-700">
					<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
					{label}
				</span>
			);
		default:
			return (
				<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300">
					{label}
				</span>
			);
	}
}

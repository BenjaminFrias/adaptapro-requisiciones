import { getEstadoLabel } from '@/constants/requisicion';
import { cn } from 'cn';

const ESTADO_STYLES: Record<string, string> = {
	BORRADOR:
		'bg-slate-100 text-slate-700 border-slate-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
	PENDIENTE_APROBACION:
		'bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/60',
	APROBADA:
		'bg-emerald-50 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/60',
	DEVUELTA:
		'bg-orange-50 text-orange-800 border-orange-200/60 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/60',
	RECHAZADA:
		'bg-rose-50 text-rose-800 border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/60',
	EN_COMPRA:
		'bg-blue-50 text-blue-800 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/60',
	ATENDIDA:
		'bg-[#035786]/10 text-[#035786] border-[#035786]/20 dark:bg-[#035786]/25 dark:text-sky-300 dark:border-[#035786]/30',
	CANCELADA:
		'bg-slate-100 text-slate-500 border-slate-200/60 line-through dark:bg-zinc-800/50 dark:text-zinc-500 dark:border-zinc-700',
};

const DEFAULT_STYLE =
	'bg-slate-100 text-slate-700 border-slate-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';

interface EstadoBadgeProps {
	estado: string;
	className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
	const label = getEstadoLabel(estado);
	const styles = ESTADO_STYLES[estado] || DEFAULT_STYLE;

	return (
		<span
			className={cn(
				'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border select-none',
				styles,
				className,
			)}
		>
			{label}
		</span>
	);
}

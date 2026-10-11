'use client';

import { useState, useTransition } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, XCircle, Loader2, AlertCircle } from 'lucide-react';
import {
	enviarRequisicion,
	cancelarRequisicion,
} from '@/actions/requisiciones';
import type { RequisicionConRelaciones } from '@/types/requisicion';

export type RequisicionModalAction = 'ENVIAR' | 'CANCELAR';

interface AccionRequisicionModalProps {
	action: RequisicionModalAction | null;
	requisicion: RequisicionConRelaciones | null;
	onClose: () => void;
	onSuccess?: () => void;
}

export function AccionRequisicionModal({
	action,
	requisicion,
	onClose,
	onSuccess,
}: AccionRequisicionModalProps) {
	const [isPending, startTransition] = useTransition();
	const [observacion, setObservacion] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleClose = () => {
		if (isPending) return;
		setObservacion('');
		setError(null);
		onClose();
	};

	if (!action || !requisicion) return null;

	const handleExecute = () => {
		if (action === 'CANCELAR' && !observacion.trim()) {
			setError('Debes indicar el motivo u observación de la cancelación.');
			return;
		}

		setError(null);
		startTransition(async () => {
			let res;
			if (action === 'ENVIAR') {
				res = await enviarRequisicion(requisicion.id);
			} else if (action === 'CANCELAR') {
				res = await cancelarRequisicion(requisicion.id, observacion.trim());
			}

			if (res && !res.success) {
				setError(res.error || 'Ocurrió un error al procesar la acción');
			} else {
				setObservacion('');
				setError(null);
				onSuccess?.();
				onClose();
			}
		});
	};

	const esDevuelta = requisicion.estado === 'DEVUELTA';

	return (
		<Dialog
			open={!!action}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
			}}
		>
			<DialogContent className="sm:max-w-md bg-white dark:bg-[#151518] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-zinc-800 shadow-2xl">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
								action === 'CANCELAR'
									? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
									: 'bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/20 dark:text-purple-300'
							}`}
						>
							{action === 'CANCELAR' ? (
								<XCircle className="w-5 h-5" />
							) : (
								<Send className="w-5 h-5" />
							)}
						</div>
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
								{action === 'CANCELAR'
									? 'Cancelar Requisición'
									: esDevuelta
									? 'Reenviar Requisición a Aprobación'
									: 'Enviar Requisición a Aprobación'}
							</DialogTitle>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{action === 'CANCELAR'
									? 'Confirma la anulación de esta solicitud'
									: esDevuelta
									? 'Reenviar con correcciones aplicadas'
									: 'Enviar para revisión y visto bueno'}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 pt-2">
					{/* Resumen de requisición seleccionada */}
					<div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-xs space-y-1">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-slate-700 dark:text-slate-300">
								{requisicion.numero ? (
									<span className="font-mono text-[#301996] dark:text-[#6a9bcc]">
										{requisicion.numero}
									</span>
								) : (
									`Borrador #${requisicion.id}`
								)}
							</span>
							<span className="text-[11px] text-slate-400">
								{requisicion.items?.length || 0}{' '}
								{requisicion.items?.length === 1 ? 'ítem' : 'ítems'}
							</span>
						</div>
						<p className="text-slate-600 dark:text-slate-400 line-clamp-2">
							{requisicion.justificacion}
						</p>
					</div>

					{action === 'ENVIAR' && (
						<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
							{esDevuelta
								? '¿Estás seguro de que deseas reenviar esta requisición a aprobación? Pasará nuevamente a revisión por el aprobador correspondiente.'
								: '¿Estás seguro de que deseas enviar esta requisición a aprobación? Pasará al estado Pendiente de Aprobación.'}
						</p>
					)}

					{action === 'CANCELAR' && (
						<div className="space-y-3">
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Esta acción cancelará permanentemente la requisición. Por favor indica el motivo u observación de la cancelación.
							</p>

							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
									Motivo u Observación de Cancelación <span className="text-rose-500">*</span>
								</label>
								<Textarea
									placeholder="Escribe el motivo de la cancelación aquí..."
									rows={3}
									value={observacion}
									onChange={(e) => {
										setObservacion(e.target.value);
										if (error) setError(null);
									}}
									className="text-xs rounded-xl"
								/>
							</div>
						</div>
					)}

					{error && (
						<div className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
							<AlertCircle className="w-4 h-4 shrink-0" />
							<span>{error}</span>
						</div>
					)}

					<div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleClose}
							disabled={isPending}
							className="rounded-xl text-xs h-9 border-slate-200 dark:border-zinc-700"
						>
							Cancelar
						</Button>

						<Button
							type="button"
							size="sm"
							disabled={isPending}
							onClick={handleExecute}
							className={`rounded-xl text-xs h-9 font-semibold text-white ${
								action === 'CANCELAR'
									? 'bg-rose-600 hover:bg-rose-700'
									: 'bg-[#301996] hover:bg-[#231270]'
							}`}
						>
							{isPending && (
								<Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
							)}
							{action === 'CANCELAR'
								? 'Confirmar Cancelación'
								: esDevuelta
								? 'Confirmar Reenvío'
								: 'Confirmar Envío'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

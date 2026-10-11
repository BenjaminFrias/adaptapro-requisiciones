'use client';

import { useTransition, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toggleEstadoUsuarioAction } from '@/actions/admin';
import type { UsuarioAdmin } from '@/types/admin';
import { Loader2, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ConfirmarEstadoUsuarioModalProps {
	usuario: UsuarioAdmin | null;
	isOpen: boolean;
	onClose: () => void;
}

export function ConfirmarEstadoUsuarioModal({
	usuario,
	isOpen,
	onClose,
}: ConfirmarEstadoUsuarioModalProps) {
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);

	if (!usuario) return null;

	const isInactivando = usuario.activo;

	const handleConfirmar = () => {
		setServerError(null);
		startTransition(async () => {
			const res = await toggleEstadoUsuarioAction(usuario.id);
			if (!res.success) {
				setServerError(res.error || 'Ocurrió un error al cambiar el estado');
			} else {
				onClose();
			}
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && !isPending && onClose()}
		>
			<DialogContent className="sm:max-w-md w-[95vw] bg-white dark:bg-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
					<div className="flex items-center gap-3">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
								isInactivando
									? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
									: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
							}`}
						>
							{isInactivando ? (
								<ShieldAlert className="w-5 h-5" />
							) : (
								<CheckCircle2 className="w-5 h-5" />
							)}
						</div>
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
								{isInactivando
									? '¿Inactivar Usuario?'
									: '¿Reactivar Usuario?'}
							</DialogTitle>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Confirma el cambio de estado para {usuario.nombre}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="p-5 sm:p-6 space-y-4">
					{serverError && (
						<div className="flex items-start gap-2.5 p-3 rounded-xl text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
							<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
							<span>{serverError}</span>
						</div>
					)}

					<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1.5">
						<div className="flex justify-between">
							<span className="text-slate-500">Usuario:</span>
							<span className="font-semibold text-slate-900 dark:text-white">
								@{usuario.usuario}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Correo:</span>
							<span className="text-slate-800 dark:text-slate-200">
								{usuario.correo}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-500">Rol:</span>
							<span className="font-medium text-slate-800 dark:text-slate-200">
								{usuario.rol}
							</span>
						</div>
					</div>

					<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
						{isInactivando ? (
							<>
								Al inactivar este usuario, <strong>no podrá iniciar sesión</strong> en el
								sistema. Sin embargo,{' '}
								<strong>todas sus requisiciones e historial de acciones se conservarán intactas</strong>{' '}
								para mantener la auditoría y trazabilidad.
							</>
						) : (
							<>
								Al reactivar la cuenta, el usuario{' '}
								<strong>podrá volver a iniciar sesión</strong> inmediatamente con sus
								mismas credenciales asignadas.
							</>
						)}
					</p>

					<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
							className="h-10 px-4 rounded-xl text-xs sm:text-sm"
						>
							Cancelar
						</Button>
						<Button
							type="button"
							onClick={handleConfirmar}
							disabled={isPending}
							className={`h-10 px-4 rounded-xl text-white font-medium text-xs sm:text-sm gap-2 shadow-sm ${
								isInactivando
									? 'bg-rose-600 hover:bg-rose-700'
									: 'bg-emerald-600 hover:bg-emerald-700'
							}`}
						>
							{isPending ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Procesando...</span>
								</>
							) : isInactivando ? (
								'Confirmar Inactivación'
							) : (
								'Confirmar Activación'
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

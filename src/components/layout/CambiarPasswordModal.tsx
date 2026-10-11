'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
	KeyRound,
	Lock,
	Eye,
	EyeOff,
	Loader2,
	AlertCircle,
	ShieldCheck,
} from 'lucide-react';
import {
	changePasswordSchema,
	type ChangePasswordInput,
} from '@/schemas/auth.schema';
import { changePasswordAction } from '@/actions/auth';

interface CambiarPasswordModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CambiarPasswordModal({
	isOpen,
	onClose,
}: CambiarPasswordModalProps) {
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	// Toggles para ver / ocultar contraseñas
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<ChangePasswordInput>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		mode: 'onChange',
	});

	const handleClose = () => {
		if (isPending) return;
		setServerError(null);
		setIsSuccess(false);
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setShowConfirmPassword(false);
		form.reset();
		onClose();
	};

	const onSubmit = (values: ChangePasswordInput) => {
		setServerError(null);

		startTransition(async () => {
			const res = await changePasswordAction(values);

			if (!res.success) {
				setServerError(
					res.error || 'Ocurrió un error al cambiar la contraseña',
				);
			} else {
				setIsSuccess(true);
				form.reset();
			}
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && !isPending && handleClose()}
		>
			<DialogContent className="sm:max-w-md w-[95vw] bg-white dark:bg-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
				{/* Cabecera del Modal */}
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#301996] to-[#035786] flex items-center justify-center text-white shadow-sm shrink-0">
							<KeyRound className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
								Cambiar Contraseña
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
								Actualiza la clave de acceso de tu cuenta de usuario.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{isSuccess ? (
					/* Vista de éxito */
					<div className="p-6 text-center space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
						<div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
							<ShieldCheck className="w-8 h-8" />
						</div>
						<div className="space-y-1.5">
							<h3 className="text-base font-bold text-slate-900 dark:text-white">
								¡Contraseña actualizada!
							</h3>
							<p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
								Tu contraseña ha sido cambiada exitosamente. Tu sesión se
								mantendrá activa y podrás usar la nueva clave en tu próximo
								inicio de sesión.
							</p>
						</div>
						<div className="pt-2">
							<Button
								type="button"
								onClick={handleClose}
								className="w-full bg-[#301996] hover:bg-[#301996]/90 text-white rounded-xl text-xs sm:text-sm font-semibold h-10 cursor-pointer"
							>
								Entendido
							</Button>
						</div>
					</div>
				) : (
					/* Formulario de cambio de contraseña */
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="p-5 sm:p-6 space-y-4"
					>
						{serverError && (
							<div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
								<AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
								<span>{serverError}</span>
							</div>
						)}

						{/* Campo: Contraseña Actual */}
						<div className="space-y-1.5">
							<Label
								htmlFor="currentPassword"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Contraseña Actual *
							</Label>
							<div className="relative">
								<Input
									id="currentPassword"
									type={showCurrentPassword ? 'text' : 'password'}
									placeholder="Ingresa tu contraseña actual"
									{...form.register('currentPassword')}
									className="h-10 pr-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
									disabled={isPending}
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
									tabIndex={-1}
									aria-label={
										showCurrentPassword
											? 'Ocultar contraseña actual'
											: 'Mostrar contraseña actual'
									}
								>
									{showCurrentPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{form.formState.errors.currentPassword && (
								<p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
									{form.formState.errors.currentPassword.message}
								</p>
							)}
						</div>

						{/* Campo: Nueva Contraseña */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="newPassword"
									className="text-xs font-semibold text-slate-700 dark:text-slate-300"
								>
									Nueva Contraseña *
								</Label>
								<span className="text-[10px] text-slate-400">
									Mínimo 8 caracteres
								</span>
							</div>
							<div className="relative">
								<Input
									id="newPassword"
									type={showNewPassword ? 'text' : 'password'}
									placeholder="Ingresa tu nueva clave de acceso"
									{...form.register('newPassword')}
									className="h-10 pr-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
									disabled={isPending}
									autoComplete="new-password"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
									tabIndex={-1}
									aria-label={
										showNewPassword
											? 'Ocultar nueva contraseña'
											: 'Mostrar nueva contraseña'
									}
								>
									{showNewPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{form.formState.errors.newPassword && (
								<p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
									{form.formState.errors.newPassword.message}
								</p>
							)}
						</div>

						{/* Campo: Confirmar Nueva Contraseña */}
						<div className="space-y-1.5">
							<Label
								htmlFor="confirmPassword"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Confirmar Nueva Contraseña *
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Repite la nueva contraseña"
									{...form.register('confirmPassword')}
									className="h-10 pr-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
									disabled={isPending}
									autoComplete="new-password"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
									tabIndex={-1}
									aria-label={
										showConfirmPassword
											? 'Ocultar confirmación de contraseña'
											: 'Mostrar confirmación de contraseña'
									}
								>
									{showConfirmPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{form.formState.errors.confirmPassword && (
								<p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
									{form.formState.errors.confirmPassword.message}
								</p>
							)}
						</div>

						{/* Footer / Botones */}
						<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
							<Button
								type="button"
								variant="ghost"
								onClick={handleClose}
								disabled={isPending}
								className="text-xs rounded-xl h-9 text-slate-600 dark:text-slate-400 cursor-pointer"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isPending}
								className="bg-[#301996] hover:bg-[#301996]/90 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm cursor-pointer"
							>
								{isPending ? (
									<>
										<Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
										Actualizando...
									</>
								) : (
									<>
										<Lock className="w-3.5 h-3.5 mr-1.5" />
										Guardar Contraseña
									</>
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}

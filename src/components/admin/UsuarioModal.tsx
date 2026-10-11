'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	usuarioFormSchema,
	type UsuarioFormData,
	type EditarUsuarioInput,
	type CrearUsuarioInput,
} from '@/schemas/usuario.schema';
import { crearUsuarioAction, editarUsuarioAction } from '@/actions/admin';
import type { UsuarioAdmin, DepartamentoSimple } from '@/types/admin';
import {
	Loader2,
	AlertCircle,
	Eye,
	EyeOff,
	UserPlus,
	Pencil,
} from 'lucide-react';

interface UsuarioModalProps {
	isOpen: boolean;
	onClose: () => void;
	usuarioAEditar: UsuarioAdmin | null;
	departamentos: DepartamentoSimple[];
	currentUserId?: number;
}

export function UsuarioModal({
	isOpen,
	onClose,
	usuarioAEditar,
	departamentos,
	currentUserId,
}: UsuarioModalProps) {
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const isEditing = !!usuarioAEditar;
	const isSelf = isEditing && currentUserId === usuarioAEditar.id;

	const form = useForm<UsuarioFormData>({
		resolver: zodResolver(usuarioFormSchema),
		defaultValues: {
			id: usuarioAEditar?.id,
			nombre: usuarioAEditar?.nombre || '',
			usuario: usuarioAEditar?.usuario || '',
			correo: usuarioAEditar?.correo || '',
			password: '',
			rol: usuarioAEditar?.rol || 'SOLICITANTE',
			departamentoId: usuarioAEditar?.departamentoId || departamentos[0]?.id || 1,
			activo: usuarioAEditar ? usuarioAEditar.activo : true,
		},
	});

	const handleClose = () => {
		if (isPending) return;
		setServerError(null);
		setShowPassword(false);
		form.reset();
		onClose();
	};

	const onSubmit = (values: UsuarioFormData) => {
		setServerError(null);
		startTransition(async () => {
			if (values.id) {
				const res = await editarUsuarioAction({
					id: values.id,
					nombre: values.nombre,
					usuario: values.usuario,
					correo: values.correo,
					password: values.password || undefined,
					rol: values.rol,
					departamentoId: values.departamentoId,
					activo: values.activo,
				} as EditarUsuarioInput);

				if (!res.success) {
					setServerError(
						res.error || 'Ocurrió un error al actualizar el usuario',
					);
				} else {
					onClose();
				}
			} else {
				const res = await crearUsuarioAction({
					nombre: values.nombre,
					usuario: values.usuario,
					correo: values.correo,
					password: values.password || '',
					rol: values.rol,
					departamentoId: values.departamentoId,
					activo: values.activo,
				} as CrearUsuarioInput);

				if (!res.success) {
					setServerError(
						res.error || 'Ocurrió un error al registrar el usuario',
					);
				} else {
					onClose();
				}
			}
		});
	};

	const rolActual = useWatch({ control: form.control, name: 'rol' });
	const deptoActual = useWatch({
		control: form.control,
		name: 'departamentoId',
	});
	const activoActual = useWatch({ control: form.control, name: 'activo' });

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && !isPending && handleClose()}
		>
			<DialogContent className="sm:max-w-lg w-[95vw] bg-white dark:bg-zinc-900 rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-[#301996]/10 text-[#301996] dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0">
							{isEditing ? (
								<Pencil className="w-5 h-5" />
							) : (
								<UserPlus className="w-5 h-5" />
							)}
						</div>
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
								{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
							</DialogTitle>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{isEditing
									? `Modifica los datos y permisos de ${usuarioAEditar.nombre}`
									: 'Ingresa los datos para registrar un usuario en el sistema'}
							</p>
						</div>
					</div>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="p-5 sm:p-6 space-y-4"
				>
					{/* Alerta de error del servidor */}
					{serverError && (
						<div className="flex items-start gap-2.5 p-3 rounded-xl text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 animate-in fade-in-50">
							<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
							<span>{serverError}</span>
						</div>
					)}

					{/* Nombre Completo */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Nombre Completo *
						</Label>
						<Input
							placeholder="Ej: Pedro Pérez"
							{...form.register('nombre')}
							className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
							disabled={isPending}
						/>
						{form.formState.errors.nombre && (
							<p className="text-[11px] text-red-600 dark:text-red-400">
								{form.formState.errors.nombre.message}
							</p>
						)}
					</div>

					{/* Nombre de Usuario y Correo en 2 columnas */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						{/* Usuario */}
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								Nombre de Usuario *
							</Label>
							<Input
								placeholder="Ej: pperez"
								{...form.register('usuario')}
								className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
								disabled={isPending}
							/>
							{form.formState.errors.usuario && (
								<p className="text-[11px] text-red-600 dark:text-red-400">
									{form.formState.errors.usuario.message}
								</p>
							)}
						</div>

						{/* Correo Electrónico */}
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								Correo Electrónico *
							</Label>
							<Input
								type="email"
								placeholder="usuario@adaptapro.com"
								{...form.register('correo')}
								className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
								disabled={isPending}
							/>
							{form.formState.errors.correo && (
								<p className="text-[11px] text-red-600 dark:text-red-400">
									{form.formState.errors.correo.message}
								</p>
							)}
						</div>
					</div>

					{/* Rol y Departamento en 2 columnas */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						{/* Rol */}
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								Rol del Sistema *
							</Label>
							<Select
								value={rolActual}
								disabled={isPending || isSelf}
								onValueChange={(val) => {
									if (val) {
										form.setValue(
											'rol',
											val as
												| 'SOLICITANTE'
												| 'APROBADOR'
												| 'COMPRAS'
												| 'ADMINISTRADOR',
										);
									}
								}}
							>
								<SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700">
									<SelectValue placeholder="Seleccionar rol">
										{rolActual}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
									<SelectItem value="SOLICITANTE">Solicitante</SelectItem>
									<SelectItem value="APROBADOR">Aprobador</SelectItem>
									<SelectItem value="COMPRAS">Compras</SelectItem>
									<SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
								</SelectContent>
							</Select>
							{isSelf && (
								<p className="text-[10px] text-amber-600 dark:text-amber-400">
									No puedes cambiar tu propio rol de Administrador
								</p>
							)}
						</div>

						{/* Departamento */}
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								Departamento *
							</Label>
							<Select
								value={String(deptoActual)}
								disabled={isPending}
								onValueChange={(val) => {
									if (val) {
										form.setValue('departamentoId', Number(val));
									}
								}}
							>
								<SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700">
									<SelectValue placeholder="Seleccionar departamento">
										{departamentos.find((d) => d.id === Number(deptoActual))
											?.nombre || 'Seleccione'}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 max-h-56">
									{departamentos.map((depto) => (
										<SelectItem key={depto.id} value={String(depto.id)}>
											{depto.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{form.formState.errors.departamentoId && (
								<p className="text-[11px] text-red-600 dark:text-red-400">
									{form.formState.errors.departamentoId.message}
								</p>
							)}
						</div>
					</div>

					{/* Contraseña */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								{isEditing
									? 'Nueva Contraseña (Opcional)'
									: 'Contraseña de Acceso *'}
							</Label>
							{isEditing && (
								<span className="text-[10px] text-slate-400">
									Dejar vacío para conservar actual
								</span>
							)}
						</div>
						<div className="relative">
							<Input
								type={showPassword ? 'text' : 'password'}
								placeholder={
									isEditing ? '•••••••• (Sin cambios)' : 'Mínimo 8 caracteres'
								}
								{...form.register('password')}
								className="h-10 pr-10 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-zinc-700"
								disabled={isPending}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
								tabIndex={-1}
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
						{form.formState.errors.password && (
							<p className="text-[11px] text-red-600 dark:text-red-400">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>

					{/* Estado Activo / Inactivo */}
					<div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800">
						<div>
							<span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
								Estado de la Cuenta
							</span>
							<p className="text-[11px] text-slate-500 dark:text-slate-400">
								{activoActual
									? 'El usuario puede iniciar sesión y operar con normalidad.'
									: 'Acceso bloqueado al sistema (soft delete).'}
							</p>
						</div>
						<button
							type="button"
							disabled={isPending || isSelf}
							onClick={() => form.setValue('activo', !activoActual)}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
								activoActual
									? 'bg-emerald-600'
									: 'bg-slate-300 dark:bg-zinc-700'
							}`}
						>
							<span
								className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
									activoActual ? 'translate-x-5' : 'translate-x-0'
								}`}
							/>
						</button>
					</div>
					{isSelf && (
						<p className="text-[10px] text-amber-600 dark:text-amber-400">
							No puedes inactivar tu propia cuenta de Administrador.
						</p>
					)}

					{/* Botones de Acción */}
					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isPending}
							className="h-10 px-4 rounded-xl text-xs sm:text-sm"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="h-10 px-5 rounded-xl bg-[#301996] hover:bg-[#25137a] text-white font-medium text-xs sm:text-sm gap-2 shadow-sm"
						>
							{isPending ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Guardando...</span>
								</>
							) : (
								<span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

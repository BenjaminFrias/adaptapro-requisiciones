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
	departamentoSchema,
	type DepartamentoFormData,
	type CrearDepartamentoInput,
	type EditarDepartamentoInput,
} from '@/schemas/departamento.schema';
import {
	crearDepartamentoAction,
	editarDepartamentoAction,
} from '@/actions/admin';
import type { DepartamentoAdmin } from '@/types/admin';
import { Loader2, AlertCircle, Building2, Pencil } from 'lucide-react';

interface DepartamentoModalProps {
	isOpen: boolean;
	onClose: () => void;
	departamentoAEditar: DepartamentoAdmin | null;
}

export function DepartamentoModal({
	isOpen,
	onClose,
	departamentoAEditar,
}: DepartamentoModalProps) {
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);

	const isEditing = !!departamentoAEditar;

	const form = useForm<DepartamentoFormData>({
		resolver: zodResolver(departamentoSchema),
		defaultValues: {
			id: departamentoAEditar?.id,
			nombre: departamentoAEditar?.nombre || '',
			activo: departamentoAEditar ? departamentoAEditar.activo : true,
		},
	});

	const activoActual = useWatch({ control: form.control, name: 'activo' });

	const handleClose = () => {
		if (isPending) return;
		setServerError(null);
		onClose();
	};

	const onSubmit = (values: DepartamentoFormData) => {
		setServerError(null);
		startTransition(async () => {
			if (values.id) {
				const res = await editarDepartamentoAction({
					id: values.id,
					nombre: values.nombre,
					activo: values.activo,
				} as EditarDepartamentoInput);

				if (!res.success) {
					setServerError(
						res.error || 'Ocurrió un error al actualizar el departamento',
					);
				} else {
					onClose();
				}
			} else {
				const res = await crearDepartamentoAction({
					nombre: values.nombre,
					activo: values.activo,
				} as CrearDepartamentoInput);

				if (!res.success) {
					setServerError(
						res.error || 'Ocurrió un error al registrar el departamento',
					);
				} else {
					onClose();
				}
			}
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => !open && !isPending && handleClose()}
		>
			<DialogContent className="sm:max-w-md w-[95vw] bg-white dark:bg-zinc-900 rounded-lg p-0 overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800">
				<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-md bg-[#035786]/10 text-[#035786] dark:bg-[#035786]/20 dark:text-sky-400 flex items-center justify-center shrink-0 border border-[#035786]/20">
							{isEditing ? (
								<Pencil className="w-5 h-5" />
							) : (
								<Building2 className="w-5 h-5" />
							)}
						</div>
						<div>
							<DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
								{isEditing
									? 'Editar Departamento'
									: 'Crear Nuevo Departamento'}
							</DialogTitle>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{isEditing
									? `Modifica el nombre o estado de ${departamentoAEditar.nombre}`
									: 'Ingresa los datos para registrar un área funcional'}
							</p>
						</div>
					</div>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="p-5 sm:p-6 space-y-4"
				>
					{serverError && (
						<div className="flex items-start gap-2.5 p-3 rounded-md text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 animate-in fade-in-50">
							<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
							<span>{serverError}</span>
						</div>
					)}

					{/* Nombre del Departamento */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Nombre del Departamento *
						</Label>
						<Input
							placeholder="Ej: Tecnología e Informática"
							{...form.register('nombre')}
							className="h-10 text-xs sm:text-sm rounded-md border-slate-200 dark:border-zinc-700 focus-visible:border-[#035786] focus-visible:ring-[#035786]/20"
							disabled={isPending}
						/>
						{form.formState.errors.nombre && (
							<p className="text-[11px] text-red-600 dark:text-red-400">
								{form.formState.errors.nombre.message}
							</p>
						)}
					</div>

					{/* Estado Activo / Inactivo */}
					<div className="pt-2 flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800">
						<div>
							<span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
								Estado del Departamento
							</span>
							<p className="text-[11px] text-slate-500 dark:text-slate-400">
								{activoActual
									? 'Disponible para asignar a usuarios y requisiciones.'
									: 'Inactivo. No aparecerá en nuevos formularios.'}
							</p>
						</div>
						<button
							type="button"
							disabled={isPending}
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

					{/* Botones de Acción */}
					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isPending}
							className="h-10 px-4 rounded-md text-xs sm:text-sm"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="h-10 px-5 rounded-md text-xs sm:text-sm gap-2 shadow-xs"
						>
							{isPending ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Guardando...</span>
								</>
							) : (
								<span>
									{isEditing
										? 'Actualizar Departamento'
										: 'Crear Departamento'}
								</span>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

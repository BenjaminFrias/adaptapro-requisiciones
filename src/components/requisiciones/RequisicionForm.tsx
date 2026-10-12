'use client';

import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	requisicionSchema,
	RequisicionInput,
} from '@/schemas/requisicion.schema';
import { crearRequisicion } from '@/actions/requisiciones';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Plus,
	Trash2,
	Send,
	Save,
	AlertCircle,
	Loader2,
	PackagePlus,
	Building2,
	Calendar,
	HelpCircle,
} from 'lucide-react';
import { formatMontoBs } from '@/utils/currency';

interface RequisicionFormDialogProps {
	departamentoNombre: string;
	requisicionInicial?: {
		id: number;
		tipo: string;
		prioridad: string;
		fechaRequerida: string | Date;
		justificacion: string;
		items: Array<{
			descripcion: string;
			cantidad: number | string;
			unidad: string;
			costoEstimado?: number | string | null;
		}>;
	} | null;
	onSuccess: () => void;
	onCancel: () => void;
}

export function RequisicionForm({
	departamentoNombre,
	requisicionInicial,
	onSuccess,
	onCancel,
}: RequisicionFormDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [serverError, setServerError] = useState<string | null>(null);

	// Fecha mínima: hoy en formato YYYY-MM-DD
	const hoy = new Date().toISOString().split('T')[0];

	const defaultFecha = requisicionInicial?.fechaRequerida
		? new Date(requisicionInicial.fechaRequerida).toISOString().split('T')[0]
		: hoy;

	const form = useForm<RequisicionInput>({
		resolver: zodResolver(requisicionSchema),
		defaultValues: {
			tipo: (requisicionInicial?.tipo as 'BIEN' | 'SERVICIO') || 'BIEN',
			prioridad:
				(requisicionInicial?.prioridad as 'NORMAL' | 'URGENTE') || 'NORMAL',
			fechaRequerida: defaultFecha,
			justificacion: requisicionInicial?.justificacion || '',
			items: requisicionInicial?.items?.length
				? requisicionInicial.items.map((it) => ({
						descripcion: it.descripcion,
						cantidad: Number(it.cantidad),
						unidad: it.unidad,
						costoEstimado:
							it.costoEstimado !== null && it.costoEstimado !== undefined
								? Number(it.costoEstimado)
								: null,
					}))
				: [
						{
							descripcion: '',
							cantidad: 1,
							unidad:
								requisicionInicial?.tipo === 'SERVICIO' ? 'servicio' : 'unid',
							costoEstimado: null,
						},
					],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'items',
	});

	// Observar tipo y artículos en tiempo real
	const watchedTipo = useWatch({
		control: form.control,
		name: 'tipo',
	});

	const watchedItems = useWatch({
		control: form.control,
		name: 'items',
	});

	const totalEstimado =
		watchedItems?.reduce((sum, item) => {
			const qty = Number(item?.cantidad || 0);
			const cost = Number(item?.costoEstimado || 0);
			return sum + (cost > 0 && qty > 0 ? cost * qty : 0);
		}, 0) || 0;

	const onSubmit = (data: RequisicionInput, enviarDirectamente: boolean) => {
		setServerError(null);
		startTransition(async () => {
			let res;
			if (requisicionInicial?.id) {
				const { editarRequisicion } = await import('@/actions/requisiciones');
				res = await editarRequisicion(
					requisicionInicial.id,
					data,
					enviarDirectamente,
				);
			} else {
				res = await crearRequisicion(data, enviarDirectamente);
			}

			if (!res.success) {
				setServerError(
					res.error || 'Ocurrió un error al procesar la requisición',
				);
			} else {
				form.reset();
				onSuccess();
			}
		});
	};

	return (
		<form className="space-y-6">
			{/* Error del servidor si ocurre */}
			{serverError && (
				<div className="flex items-start gap-2.5 p-3 rounded-md text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 animate-in fade-in-50">
					<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
					<span>{serverError}</span>
				</div>
			)}

			{/* Sección 1: Información General */}
			<div className="space-y-4">
				<div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/80 dark:border-zinc-800">
					<span className="w-5 h-5 rounded-md bg-[#035786]/10 text-[#035786] dark:bg-[#035786]/20 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
						1
					</span>
					<h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
						Información General
					</h3>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 p-3.5 sm:p-4 rounded-md bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800">
					{/* Departamento */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
							<Building2 className="w-3.5 h-3.5 text-slate-400" />
							Departamento
						</Label>
						<Input
							value={departamentoNombre}
							disabled
							className="h-10 bg-white/80 dark:bg-zinc-800/80 font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-not-allowed rounded-md border-slate-200 dark:border-zinc-700 px-3"
						/>
						<p className="text-[11px] text-slate-400">
							Asignado automáticamente
						</p>
					</div>

					{/* Tipo de Requisición */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
							Tipo de Requerimiento *
						</Label>
						<Select
							defaultValue={form.getValues('tipo')}
							onValueChange={(val) => {
								if (val) {
									const nuevoTipo = val as 'BIEN' | 'SERVICIO';
									form.setValue('tipo', nuevoTipo);
									// Si es un formulario nuevo, actualizar items existentes que tengan la unidad por defecto
									const currentItems = form.getValues('items') || [];
									currentItems.forEach((item, idx) => {
										if (
											!item.unidad ||
											item.unidad === 'unid' ||
											item.unidad === 'servicio'
										) {
											form.setValue(
												`items.${idx}.unidad`,
												nuevoTipo === 'SERVICIO' ? 'servicio' : 'unid',
											);
										}
									});
								}
							}}
						>
							<SelectTrigger className="h-10 bg-white dark:bg-zinc-800 text-xs sm:text-sm rounded-md border-slate-200 dark:border-zinc-700 focus:ring-[#035786]/20 px-3">
								<SelectValue placeholder="Seleccionar tipo" />
							</SelectTrigger>
							<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
								<SelectItem value="BIEN">Bien</SelectItem>
								<SelectItem value="SERVICIO">Servicio</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Prioridad */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
							Prioridad *
						</Label>
						<Select
							defaultValue={form.getValues('prioridad')}
							onValueChange={(val) => {
								if (val)
									form.setValue('prioridad', val as 'NORMAL' | 'URGENTE');
							}}
						>
							<SelectTrigger className="h-10 bg-white dark:bg-zinc-800 text-xs sm:text-sm rounded-md border-slate-200 dark:border-zinc-700 focus:ring-[#035786]/20 px-3">
								<SelectValue placeholder="Prioridad" />
							</SelectTrigger>
							<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
								<SelectItem value="NORMAL">Normal</SelectItem>
								<SelectItem value="URGENTE">Urgente</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Fecha Requerida */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5 text-slate-400" />
							Fecha Límite Deseada *
						</Label>
						<Input
							type="date"
							min={hoy}
							{...form.register('fechaRequerida')}
							className="h-10 bg-white dark:bg-zinc-800 text-xs sm:text-sm rounded-md border-slate-200 dark:border-zinc-700 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786] px-3"
						/>
						{form.formState.errors.fechaRequerida && (
							<p className="text-[11px] text-red-500 font-medium">
								{form.formState.errors.fechaRequerida.message}
							</p>
						)}
					</div>
				</div>

				{/* Justificación */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
							Justificación o Motivo del Requerimiento *
						</Label>
						<span className="text-[11px] text-slate-400">
							Detalla el destino o necesidad
						</span>
					</div>
					<Textarea
						placeholder="Describe brevemente por qué es necesario este requerimiento y para qué área u objetivo se utilizará..."
						rows={3}
						{...form.register('justificacion')}
						className="text-xs sm:text-sm bg-white dark:bg-zinc-900 rounded-md border-slate-200 dark:border-zinc-700/80 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786] p-3 leading-relaxed"
					/>
					{form.formState.errors.justificacion && (
						<p className="text-[11px] text-red-500 font-medium">
							{form.formState.errors.justificacion.message}
						</p>
					)}
				</div>
			</div>

			{/* Sección 2: Artículos o Servicios */}
			<div className="space-y-3 pt-2">
				<div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 dark:border-zinc-800">
					<div className="flex items-center gap-2">
						<span className="w-5 h-5 rounded-md bg-[#035786]/10 text-[#035786] dark:bg-[#035786]/20 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
							2
						</span>
						<h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
							<PackagePlus className="w-4 h-4 text-[#035786] dark:text-sky-400" />
							{watchedTipo === 'SERVICIO'
								? 'Servicios Solicitados'
								: 'Artículos Solicitados'}
						</h3>
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							append({
								descripcion: '',
								cantidad: 1,
								unidad: watchedTipo === 'SERVICIO' ? 'servicio' : 'unid',
								costoEstimado: null,
							})
						}
						className="text-xs h-8 px-2.5 rounded-md gap-1.5 border-slate-200 dark:border-zinc-700 hover:border-[#035786] hover:text-[#035786] transition-colors"
					>
						<Plus className="w-3.5 h-3.5" />
						<span>
							{watchedTipo === 'SERVICIO' ? 'Agregar servicio' : 'Agregar artículo'}
						</span>
					</Button>
				</div>

				{form.formState.errors.items?.message && (
					<p className="text-xs text-red-500 font-medium">
						{form.formState.errors.items.message}
					</p>
				)}

				{/* Encabezados de tabla de ítems para pantallas medianas */}
				<div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
					<div className="col-span-5">
						{watchedTipo === 'SERVICIO'
							? 'Descripción del Servicio *'
							: 'Descripción del Ítem *'}
					</div>
					<div className="col-span-2">Cantidad *</div>
					<div className="col-span-2">Unidad *</div>
					<div className="col-span-2 text-right">Costo Est. (Bs)</div>
					<div className="col-span-1 text-center">Acción</div>
				</div>

				<div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
					{fields.map((field, index) => (
						<div
							key={field.id}
							className="grid grid-cols-12 gap-2 items-start p-2.5 rounded-md border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-xs transition-colors hover:border-slate-300 dark:hover:border-zinc-700"
						>
							{/* Descripción */}
							<div className="col-span-12 sm:col-span-5 space-y-1">
								<Input
									placeholder={
										watchedTipo === 'SERVICIO'
											? 'ej. Mantenimiento preventivo de aires acondicionados *'
											: 'ej. Papel bond tamaño carta 75g *'
									}
									{...form.register(`items.${index}.descripcion`)}
									className="h-8.5 text-xs bg-white dark:bg-zinc-800 rounded-md border-slate-200 dark:border-zinc-700 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786]"
								/>
								{form.formState.errors.items?.[index]?.descripcion && (
									<p className="text-[10px] text-red-500 font-medium">
										{form.formState.errors.items[index]?.descripcion?.message}
									</p>
								)}
							</div>

							{/* Cantidad */}
							<div className="col-span-6 sm:col-span-2 space-y-1">
								<Input
									type="number"
									step="any"
									placeholder="Cant. *"
									{...form.register(`items.${index}.cantidad`, {
										valueAsNumber: true,
									})}
									className="h-8.5 text-xs bg-white dark:bg-zinc-800 rounded-md border-slate-200 dark:border-zinc-700 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786]"
								/>
								{form.formState.errors.items?.[index]?.cantidad && (
									<p className="text-[10px] text-red-500 font-medium">
										{form.formState.errors.items[index]?.cantidad?.message}
									</p>
								)}
							</div>

							{/* Unidad */}
							<div className="col-span-6 sm:col-span-2 space-y-1">
								<Input
									placeholder={
										watchedTipo === 'SERVICIO'
											? 'ej. servicio, hrs, mes'
											: 'Unid. (pza, resma)'
									}
									{...form.register(`items.${index}.unidad`)}
									className="h-8.5 text-xs bg-white dark:bg-zinc-800 rounded-md border-slate-200 dark:border-zinc-700 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786]"
								/>
								{form.formState.errors.items?.[index]?.unidad && (
									<p className="text-[10px] text-red-500 font-medium">
										{form.formState.errors.items[index]?.unidad?.message}
									</p>
								)}
							</div>

							{/* Costo Estimado */}
							<div className="col-span-10 sm:col-span-2 space-y-1">
								<Controller
									control={form.control}
									name={`items.${index}.costoEstimado`}
									render={({ field }) => (
										<CurrencyInput
											value={field.value}
											onChange={field.onChange}
											className="h-8.5 text-xs bg-white dark:bg-zinc-800 rounded-md border-slate-200 dark:border-zinc-700 focus-visible:ring-[#035786]/20 focus-visible:border-[#035786]"
										/>
									)}
								/>
							</div>

							{/* Eliminar fila */}
							<div className="col-span-2 sm:col-span-1 flex justify-center pt-0.5">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => remove(index)}
									disabled={fields.length === 1}
									className="h-8 w-8 p-0 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-20"
									title="Eliminar partida"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					))}
				</div>

				{/* Resumen Total Estimado */}
				<div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 gap-2">
					<div className="flex items-center gap-1.5 text-xs text-slate-500">
						<HelpCircle className="w-3.5 h-3.5 text-slate-400" />
						<span>El costo estimado es referencial para la aprobación.</span>
					</div>

					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
							Total Estimado:
						</span>
						<span className="text-sm sm:text-base font-semibold font-mono text-[#035786] dark:text-sky-400 tabular-nums">
							{formatMontoBs(totalEstimado, true)}
						</span>
					</div>
				</div>
			</div>

			{/* Botones de Acción */}
			<div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
					className="text-xs sm:text-sm h-10 px-4 rounded-md border-slate-200 dark:border-zinc-700"
				>
					Cancelar
				</Button>

				<Button
					type="button"
					variant="secondary"
					disabled={isPending}
					onClick={form.handleSubmit((data) => onSubmit(data, false))}
					className="text-xs sm:text-sm h-10 px-4 rounded-md gap-2 font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200"
				>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					Guardar Borrador
				</Button>

				<Button
					type="button"
					disabled={isPending}
					onClick={form.handleSubmit((data) => onSubmit(data, true))}
					className="text-xs sm:text-sm h-10 px-5 rounded-md gap-2 font-semibold shadow-xs"
				>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<Send className="w-4 h-4" />
					)}
					Enviar a Aprobación
				</Button>
			</div>
		</form>
	);
}

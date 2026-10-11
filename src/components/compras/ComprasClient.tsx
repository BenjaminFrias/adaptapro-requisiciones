'use client';

import { useState, useTransition } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Timeline } from '@/components/requisiciones/Timeline';
import { registrarEnCompra, marcarAtendida } from '@/actions/compras';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	ShoppingBag,
	CheckCircle,
	Truck,
	Eye,
	Search,
	AlertCircle,
	Loader2,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { formatMontoBs, parseMontoBs } from '@/utils/currency';
import {
	ESTADOS_FILTRO_COMPRAS,
	getEstadoLabel,
} from '@/constants/requisicion';

interface ComprasClientProps {
	user: {
		nombre: string;
		usuario: string;
		rol: string;
		departamentoNombre: string;
	};
	requisiciones: RequisicionConRelaciones[];
}

export function ComprasClient({ user, requisiciones }: ComprasClientProps) {
	const [isPending, startTransition] = useTransition();
	const [busqueda, setBusqueda] = useState('');
	const [filtroEstado, setFiltroEstado] = useState('TODOS');
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);

	// Estados modal "En Compra"
	const [openModalCompra, setOpenModalCompra] = useState(false);
	const [reqParaCompra, setReqParaCompra] =
		useState<RequisicionConRelaciones | null>(null);
	const [proveedor, setProveedor] = useState('');
	const [numeroOrdenCompra, setNumeroOrdenCompra] = useState('');
	const [costoFinalTexto, setCostoFinalTexto] = useState('');
	const [fechaEntrega, setFechaEntrega] = useState('');
	const [errorCompra, setErrorCompra] = useState<string | null>(null);

	// Estados modal "Atendida"
	const [openModalAtendida, setOpenModalAtendida] = useState(false);
	const [reqParaAtendida, setReqParaAtendida] =
		useState<RequisicionConRelaciones | null>(null);
	const [comentarioAtendida, setComentarioAtendida] = useState('');

	const listaFiltrada = requisiciones.filter((req) => {
		const coincideTexto =
			(req.numero &&
				req.numero.toLowerCase().includes(busqueda.toLowerCase())) ||
			req.justificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
			(req.solicitante?.nombre &&
				req.solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase()));

		const coincideEstado =
			filtroEstado === 'TODOS' || req.estado === filtroEstado;
		return coincideTexto && coincideEstado;
	});

	const handleOpenCompra = (req: RequisicionConRelaciones) => {
		setReqParaCompra(req);
		setProveedor(req.comprasDatos?.proveedor || '');
		setNumeroOrdenCompra(
			req.comprasDatos?.numeroOrdenCompra ||
				`OC-${new Date().getFullYear()}-${String(req.id).padStart(4, '0')}`,
		);
		setCostoFinalTexto(
			req.comprasDatos?.costoFinal
				? formatMontoBs(Number(req.comprasDatos.costoFinal))
				: '',
		);
		setFechaEntrega(
			req.comprasDatos?.fechaEntregaEstimada
				? new Date(req.comprasDatos.fechaEntregaEstimada)
						.toISOString()
						.split('T')[0]
				: '',
		);
		setErrorCompra(null);
		setOpenModalCompra(true);
	};

	const handleGuardarCompra = () => {
		if (!reqParaCompra) return;

		const parsedCosto = parseMontoBs(costoFinalTexto);
		if (!parsedCosto || parsedCosto <= 0) {
			setErrorCompra('Ingresa un costo final válido mayor a 0');
			return;
		}

		if (!proveedor.trim()) {
			setErrorCompra('El nombre del proveedor es obligatorio');
			return;
		}

		if (!numeroOrdenCompra.trim()) {
			setErrorCompra('El número de orden de compra es obligatorio');
			return;
		}

		setErrorCompra(null);
		startTransition(async () => {
			const res = await registrarEnCompra(reqParaCompra.id, {
				proveedor: proveedor.trim(),
				numeroOrdenCompra: numeroOrdenCompra.trim(),
				costoFinal: parsedCosto,
				fechaEntregaEstimada: fechaEntrega || null,
			});

			if (!res.success) {
				setErrorCompra(res.error || 'Ocurrió un error al registrar la compra');
			} else {
				setOpenModalCompra(false);
				setReqParaCompra(null);
			}
		});
	};

	const handleOpenAtendida = (req: RequisicionConRelaciones) => {
		setReqParaAtendida(req);
		setComentarioAtendida('');
		setOpenModalAtendida(true);
	};

	const handleGuardarAtendida = () => {
		if (!reqParaAtendida) return;

		startTransition(async () => {
			const res = await marcarAtendida(reqParaAtendida.id, comentarioAtendida);
			if (res.success) {
				setOpenModalAtendida(false);
				setReqParaAtendida(null);
			}
		});
	};

	return (
		<div className="min-h-screen bg-[#fafafc] dark:bg-[#0e0e11] flex flex-col antialiased">
			<Navbar user={user} />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
				{/* Encabezado */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
								<ShoppingBag className="w-3.5 h-3.5" />
								Bandeja de Compras
							</span>
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
							Atención y Gestión de Pedidos
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
							Registra proveedores, órdenes de compra y marca las requisiciones
							como atendidas.
						</p>
					</div>

					<div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Buscar por número o proveedor..."
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								className="pl-9.5 h-10 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
							/>
						</div>

						<Select
							items={ESTADOS_FILTRO_COMPRAS}
							value={filtroEstado}
							onValueChange={(val) => setFiltroEstado(val || 'TODOS')}
						>
							<SelectTrigger className="h-10 min-w-44 text-xs sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl">
								<SelectValue placeholder="Todos los estados">
									{(val) => getEstadoLabel(val) || 'Todos los estados'}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800">
								{ESTADOS_FILTRO_COMPRAS.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Tabla de Requisiciones para Compras */}
				<div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs">
					<Table>
						<TableHeader className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
							<TableRow className="hover:bg-transparent">
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 pl-5">
									Correlativo
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
									Solicitante / Dpto.
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
									Items
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
									Orden / Proveedor
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">
									Estado
								</TableHead>
								<TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5 text-right pr-5">
									Atención
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{listaFiltrada.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-44 text-center text-xs text-slate-500"
									>
										<div className="flex flex-col items-center justify-center gap-2">
											<div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
												<ShoppingBag className="w-6 h-6 stroke-[1.5]" />
											</div>
											<p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
												Sin requisiciones pendientes
											</p>
											<p className="text-slate-400 text-xs">
												No hay requisiciones aprobadas o en compra pendientes
												por gestionar.
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								listaFiltrada.map((req) => (
									<TableRow
										key={req.id}
										className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800/70"
									>
										<TableCell className="py-3.5 pl-5 font-mono font-bold text-xs text-[#301996] dark:text-[#6a9bcc]">
											{req.numero}
										</TableCell>

										<TableCell className="py-3.5 text-xs">
											<div className="font-semibold text-slate-800 dark:text-slate-200">
												{req.solicitante?.nombre || 'Usuario'}
											</div>
											<span className="text-[11px] text-slate-400">
												{req.departamento?.nombre}
											</span>
										</TableCell>

										<TableCell className="py-3.5 text-xs">
											<span className="font-medium text-slate-700 dark:text-slate-300">
												{req.items?.length || 0}{' '}
												{req.items?.length === 1 ? 'ítem' : 'ítems'}
											</span>
										</TableCell>

										<TableCell className="py-3.5 text-xs">
											{req.comprasDatos ? (
												<div>
													<div className="font-mono font-bold text-slate-800 dark:text-slate-200">
														{req.comprasDatos.numeroOrdenCompra}
													</div>
													<span className="text-[11px] text-slate-400 truncate block max-w-40">
														{req.comprasDatos.proveedor}
													</span>
												</div>
											) : (
												<span className="text-slate-400 italic text-xs">
													Sin orden aún
												</span>
											)}
										</TableCell>

										<TableCell className="py-3.5">
											<EstadoBadge estado={req.estado} />
										</TableCell>

										<TableCell className="py-3.5 text-right pr-5">
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900"
													onClick={() => setSelectedReq(req)}
													title="Ver Detalle"
												>
													<Eye className="w-4 h-4" />
												</Button>

												{/* Botón "En Compra" (para APROBADA o para actualizar EN_COMPRA) */}
												{req.estado === 'APROBADA' && (
													<Button
														size="sm"
														onClick={() => handleOpenCompra(req)}
														className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
													>
														<Truck className="w-3.5 h-3.5" />
														Procesar Compra
													</Button>
												)}

												{/* Botón "Atendida" (cuando ya está EN_COMPRA) */}
												{req.estado === 'EN_COMPRA' && (
													<>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleOpenCompra(req)}
															className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-50"
														>
															Editar OC
														</Button>

														<Button
															size="sm"
															onClick={() => handleOpenAtendida(req)}
															className="h-8 px-3 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white gap-1"
														>
															<CheckCircle className="w-3.5 h-3.5" />
															Marcar Atendida
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Modal de Detalle */}
				<Dialog
					open={!!selectedReq}
					onOpenChange={(open) => !open && setSelectedReq(null)}
				>
					<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-[#151518] rounded-2xl p-0 overflow-hidden">
						<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
							<div className="flex items-center justify-between">
								<DialogTitle className="text-base sm:text-lg font-bold">
									Requisición: {selectedReq?.numero}
								</DialogTitle>
								{selectedReq && <EstadoBadge estado={selectedReq.estado} />}
							</div>
						</DialogHeader>

						{selectedReq && (
							<div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
								<div className="space-y-1">
									<span className="text-xs font-semibold text-slate-700">
										Justificación
									</span>
									<p className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
										{selectedReq.justificacion}
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-xs font-semibold text-slate-700">
										Artículos
									</span>
									<div className="rounded-xl border border-slate-200 overflow-hidden">
										<table className="w-full text-left text-xs">
											<thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
												<tr>
													<th className="p-2.5">Descripción</th>
													<th className="p-2.5">Cant.</th>
													<th className="p-2.5">Unidad</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{selectedReq.items?.map((item) => (
													<tr key={item.id}>
														<td className="p-2.5 font-medium">
															{item.descripcion}
														</td>
														<td className="p-2.5">{Number(item.cantidad)}</td>
														<td className="p-2.5">{item.unidad}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								{selectedReq.comprasDatos && (
									<div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs space-y-1">
										<span className="font-bold text-blue-900 block uppercase text-[10px]">
											Datos de Compra Registrados
										</span>
										<p>
											<strong>Proveedor:</strong>{' '}
											{selectedReq.comprasDatos.proveedor} |{' '}
											<strong>Orden:</strong>{' '}
											{selectedReq.comprasDatos.numeroOrdenCompra}
										</p>
										<p>
											<strong>Costo Final:</strong>{' '}
											{formatMontoBs(
												Number(selectedReq.comprasDatos.costoFinal),
												true,
											)}
										</p>
									</div>
								)}

								<div className="space-y-2 pt-2">
									<span className="text-xs font-semibold text-slate-700 block">
										Línea de Tiempo
									</span>
									<Timeline historial={selectedReq.historial} />
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

				{/* Modal Registrar En Compra (RF-17) */}
				<Dialog open={openModalCompra} onOpenChange={setOpenModalCompra}>
					<DialogContent className="sm:max-w-md bg-white dark:bg-[#151518] rounded-2xl p-5 sm:p-6 border border-slate-200">
						<DialogHeader>
							<DialogTitle className="text-base sm:text-lg font-bold">
								Registrar Datos de Compra (RF-17)
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 pt-2">
							{errorCompra && (
								<div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
									<AlertCircle className="w-4 h-4 shrink-0" />
									<span>{errorCompra}</span>
								</div>
							)}

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">
									Proveedor Asignado *
								</Label>
								<Input
									placeholder="ej. Distribuidora Central C.A."
									value={proveedor}
									onChange={(e) => setProveedor(e.target.value)}
									className="text-xs rounded-xl h-10"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">
									Número de Orden de Compra *
								</Label>
								<Input
									placeholder="ej. OC-2026-0042"
									value={numeroOrdenCompra}
									onChange={(e) => setNumeroOrdenCompra(e.target.value)}
									className="text-xs rounded-xl h-10 font-mono"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">
									Costo Final Acordado (Bs.) *
								</Label>
								<Input
									type="text"
									placeholder="ej. 15.450,00"
									value={costoFinalTexto}
									onChange={(e) => setCostoFinalTexto(e.target.value)}
									onBlur={() => {
										const parsed = parseMontoBs(costoFinalTexto);
										if (parsed !== null)
											setCostoFinalTexto(formatMontoBs(parsed));
									}}
									className="text-xs rounded-xl h-10 font-mono text-right"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">
									Fecha Estimada de Entrega
								</Label>
								<Input
									type="date"
									value={fechaEntrega}
									onChange={(e) => setFechaEntrega(e.target.value)}
									className="text-xs rounded-xl h-10"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setOpenModalCompra(false)}
									disabled={isPending}
									className="rounded-xl text-xs h-9"
								>
									Cancelar
								</Button>
								<Button
									size="sm"
									onClick={handleGuardarCompra}
									disabled={isPending}
									className="rounded-xl text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
								>
									{isPending ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
									) : null}
									Guardar y Marcar &quot;En Compra&quot;
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Modal Marcar Atendida (RF-18) */}
				<Dialog open={openModalAtendida} onOpenChange={setOpenModalAtendida}>
					<DialogContent className="sm:max-w-md bg-white dark:bg-[#151518] rounded-2xl p-5 sm:p-6 border border-slate-200">
						<DialogHeader>
							<DialogTitle className="text-base sm:text-lg font-bold">
								Marcar Requisición como Atendida (RF-18)
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 pt-2">
							<p className="text-xs text-slate-500">
								Confirma que los bienes o servicios de la orden han sido
								recibidos e inspeccionados.
							</p>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">
									Comentario o Nota de Recepción
								</Label>
								<Textarea
									placeholder="ej. Mercancía recibida en almacén central sin novedades..."
									rows={3}
									value={comentarioAtendida}
									onChange={(e) => setComentarioAtendida(e.target.value)}
									className="text-xs rounded-xl"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setOpenModalAtendida(false)}
									disabled={isPending}
									className="rounded-xl text-xs h-9"
								>
									Cancelar
								</Button>
								<Button
									size="sm"
									onClick={handleGuardarAtendida}
									disabled={isPending}
									className="rounded-xl text-xs h-9 bg-purple-700 hover:bg-purple-800 text-white font-semibold"
								>
									{isPending ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
									) : null}
									Confirmar Entrega Atendida
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}

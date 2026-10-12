'use client';

import { useState, useTransition } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { Timeline } from '@/components/requisiciones/Timeline';
import { registrarEnCompra, marcarAtendida } from '@/actions/compras';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
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
	ShoppingBag,
	CheckCircle,
	Truck,
	Eye,
	Search,
	AlertCircle,
	Loader2,
	X,
} from 'lucide-react';
import type { RequisicionConRelaciones } from '@/types/requisicion';
import { formatMontoBs, parseMontoBs } from '@/utils/currency';
import { ESTADOS_FILTRO_COMPRAS } from '@/constants/requisicion';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';

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

	// Paginación reactiva sobre los resultados filtrados
	const {
		currentPage,
		pageSize,
		totalPages,
		totalItems,
		paginatedItems,
		startItem,
		endItem,
		canNext,
		canPrev,
		goToPage,
		setPageSize,
	} = usePagination({
		items: listaFiltrada,
		initialPageSize: 15,
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
				{/* Encabezado Unificado */}
				<PageHeader
					title="Atención y gestión de pedidos"
					description="Registra proveedores, órdenes de compra y marca las requisiciones como atendidas."
				/>

				{/* Tabla de Requisiciones con Cabecera Integrada */}
				<div className="rounded-md border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
					{/* Cabecera integrada: Tabs rápidos de estado + Buscador compacto */}
					<div className="p-2 sm:px-3 sm:py-2.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900">
						{/* Tabs rápidos de estado */}
						<div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
							{ESTADOS_FILTRO_COMPRAS.map((tab) => {
								const isActive = filtroEstado === tab.value;
								return (
									<button
										key={tab.value}
										type="button"
										onClick={() => setFiltroEstado(tab.value)}
										className={cn(
											'inline-flex items-center px-2.5 py-1.5 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer select-none',
											isActive
												? 'bg-[#035786] text-white font-medium shadow-none'
												: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium',
										)}
									>
										{tab.label}
									</button>
								);
							})}
						</div>

						{/* Buscador compacto a la derecha */}
						<div className="relative w-full md:w-64 shrink-0">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
							<Input
								placeholder="Buscar número o proveedor..."
								value={busqueda}
								onChange={(e) => setBusqueda(e.target.value)}
								className="h-8.5 pl-8 pr-7 text-xs bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/80 rounded-md focus-visible:bg-white focus-visible:border-[#035786]"
							/>
							{busqueda && (
								<button
									type="button"
									onClick={() => setBusqueda('')}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
									aria-label="Limpiar búsqueda"
								>
									<X className="w-3 h-3" />
								</button>
							)}
						</div>
					</div>

					<Table>
						<TableHeader className="bg-slate-50/75 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800">
							<TableRow className="hover:bg-transparent">
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 pl-5">
									Correlativo
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Solicitante / Dpto.
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Items
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Orden / Proveedor
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3">
									Estado
								</TableHead>
								<TableHead className="text-xs font-medium text-slate-500 dark:text-zinc-400 py-3 text-right pr-5">
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
										<div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
											<div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
												<ShoppingBag className="w-5 h-5 stroke-[1.5]" />
											</div>
											<p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
												Sin requisiciones encontradas
											</p>
											<p className="text-slate-400 text-xs">
												{busqueda || filtroEstado !== 'TODOS'
													? 'Prueba modificando los filtros de búsqueda o el estado seleccionado.'
													: 'No hay requisiciones aprobadas o en compra pendientes por gestionar.'}
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								paginatedItems.map((req) => (
									<TableRow
										key={req.id}
										onClick={() => setSelectedReq(req)}
										className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800/70 group"
									>
										<TableCell className="py-3 pl-5">
											<span className="font-mono font-medium text-xs text-[#035786] dark:text-sky-400 bg-[#035786]/10 dark:bg-[#035786]/20 px-2 py-0.5 rounded-md border border-[#035786]/20">
												{req.numero}
											</span>
										</TableCell>

										<TableCell className="py-3 text-xs">
											<div className="font-medium text-slate-800 dark:text-slate-200">
												{req.solicitante?.nombre || 'Usuario'}
											</div>
											<span className="text-[11px] text-slate-400">
												{req.departamento?.nombre}
											</span>
										</TableCell>

										<TableCell className="py-3 text-xs">
											<span className="font-medium text-slate-700 dark:text-slate-300">
												{req.items?.length || 0}{' '}
												{req.items?.length === 1 ? 'ítem' : 'ítems'}
											</span>
										</TableCell>

										<TableCell className="py-3 text-xs">
											{req.comprasDatos ? (
												<div>
													<div className="font-mono font-medium text-slate-800 dark:text-slate-200">
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

										<TableCell className="py-3">
											<EstadoBadge estado={req.estado} />
										</TableCell>

										<TableCell className="py-3 text-right pr-5">
											<div className="flex items-center justify-end gap-1.5">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedReq(req);
													}}
													title="Ver Detalle"
												>
													<Eye className="w-4 h-4" />
												</Button>

												{/* Botón "En Compra" (para APROBADA) */}
												{req.estado === 'APROBADA' && (
													<Button
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleOpenCompra(req);
														}}
														className="h-8 px-2.5 rounded-md text-xs font-medium bg-[#035786] hover:bg-[#02456b] text-white gap-1"
													>
														<Truck className="w-3.5 h-3.5" />
														Procesar Compra
													</Button>
												)}

												{/* Botones cuando ya está EN_COMPRA */}
												{req.estado === 'EN_COMPRA' && (
													<>
														<Button
															variant="outline"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleOpenCompra(req);
															}}
															className="h-8 px-2.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"
														>
															Editar OC
														</Button>

														<Button
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleOpenAtendida(req);
															}}
															className="h-8 px-3 rounded-md text-xs font-medium bg-[#035786] hover:bg-[#02456b] text-white gap-1"
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

					{/* Paginador */}
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						pageSize={pageSize}
						startItem={startItem}
						endItem={endItem}
						canNext={canNext}
						canPrev={canPrev}
						onPageChange={goToPage}
						onPageSizeChange={setPageSize}
					/>
				</div>

				{/* Modal de Detalle */}
				<Dialog
					open={!!selectedReq}
					onOpenChange={(open) => !open && setSelectedReq(null)}
				>
					<DialogContent className="sm:max-w-2xl w-[95vw] max-w-2xl bg-white dark:bg-zinc-900 rounded-lg p-0 overflow-hidden border border-slate-200 dark:border-zinc-800">
						<DialogHeader className="p-5 sm:p-6 bg-slate-50/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
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
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
										Justificación
									</span>
									<p className="p-3 rounded-md bg-slate-50 dark:bg-zinc-800 text-xs text-slate-700 dark:text-slate-300">
										{selectedReq.justificacion}
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
										Artículos
									</span>
									<div className="rounded-md border border-slate-200 dark:border-zinc-800 overflow-hidden">
										<table className="w-full text-left text-xs">
											<thead className="bg-slate-50 dark:bg-zinc-800 text-[11px] font-medium text-slate-500 uppercase">
												<tr>
													<th className="p-2.5">Descripción</th>
													<th className="p-2.5">Cant.</th>
													<th className="p-2.5">Unidad</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
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
									<div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-md border border-sky-200/60 dark:border-sky-900/40 text-xs space-y-1">
										<span className="font-semibold text-[#035786] dark:text-sky-400 block uppercase text-[10px]">
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
									<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
					<DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-zinc-800">
						<DialogHeader>
							<DialogTitle className="text-base sm:text-lg font-bold">
								Registrar Datos de Compra (RF-17)
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 pt-2">
							{errorCompra && (
								<div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
									<AlertCircle className="w-4 h-4 shrink-0" />
									<span>{errorCompra}</span>
								</div>
							)}

							<div className="space-y-1.5">
								<Label className="text-xs font-medium">
									Proveedor Asignado *
								</Label>
								<Input
									placeholder="ej. Distribuidora Central C.A."
									value={proveedor}
									onChange={(e) => setProveedor(e.target.value)}
									className="text-xs rounded-md h-9"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-medium">
									Número de Orden de Compra *
								</Label>
								<Input
									placeholder="ej. OC-2026-0042"
									value={numeroOrdenCompra}
									onChange={(e) => setNumeroOrdenCompra(e.target.value)}
									className="text-xs rounded-md h-9 font-mono"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-medium">
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
									className="text-xs rounded-md h-9 font-mono text-right"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-medium">
									Fecha Estimada de Entrega
								</Label>
								<Input
									type="date"
									value={fechaEntrega}
									onChange={(e) => setFechaEntrega(e.target.value)}
									className="text-xs rounded-md h-9"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setOpenModalCompra(false)}
									disabled={isPending}
									className="rounded-md text-xs h-9"
								>
									Cancelar
								</Button>
								<Button
									size="sm"
									onClick={handleGuardarCompra}
									disabled={isPending}
									className="rounded-md text-xs h-9 bg-[#035786] hover:bg-[#02456b] text-white font-medium"
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
					<DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-zinc-800">
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
								<Label className="text-xs font-medium">
									Comentario o Nota de Recepción
								</Label>
								<Textarea
									placeholder="ej. Mercancía recibida en almacén central sin novedades..."
									rows={3}
									value={comentarioAtendida}
									onChange={(e) => setComentarioAtendida(e.target.value)}
									className="text-xs rounded-md"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setOpenModalAtendida(false)}
									disabled={isPending}
									className="rounded-md text-xs h-9"
								>
									Cancelar
								</Button>
								<Button
									size="sm"
									onClick={handleGuardarAtendida}
									disabled={isPending}
									className="rounded-md text-xs h-9 bg-[#035786] hover:bg-[#02456b] text-white font-medium"
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

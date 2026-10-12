'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Loader2, X } from 'lucide-react';
import { buscarRequisicionesRapidas } from '@/actions/requisiciones';
import { EstadoBadge } from '@/components/requisiciones/EstadoBadge';
import { RequisicionDetalleModal } from '@/components/requisiciones/RequisicionDetalleModal';
import type { RequisicionConRelaciones } from '@/types/requisicion';

export function NavbarSearch() {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<RequisicionConRelaciones[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const searchModalRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Función para ejecutar la búsqueda
	const performSearch = useCallback(async (searchQuery: string) => {
		setIsLoading(true);
		try {
			const res = await buscarRequisicionesRapidas(searchQuery);
			if (res.success && res.requisiciones) {
				setResults(res.requisiciones as unknown as RequisicionConRelaciones[]);
			} else {
				setResults([]);
			}
		} catch (error) {
			console.error('Error al buscar requisiciones:', error);
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Manejo del cambio en el input con debounce
	const handleQueryChange = (value: string) => {
		setQuery(value);

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			performSearch(value);
		}, 250);
	};

	// Cargar recientes al abrir la búsqueda
	const handleOpen = useCallback(() => {
		setIsOpen(true);
		setQuery('');
		performSearch('');
	}, [performSearch]);

	// Cerrar búsqueda
	const handleClose = useCallback(() => {
		setIsOpen(false);
		setQuery('');
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
	}, []);

	// Cerrar al hacer clic afuera
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				searchModalRef.current &&
				!searchModalRef.current.contains(e.target as Node)
			) {
				handleClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, handleClose]);

	// Atajos de teclado: Cmd+K / Ctrl+K para abrir, Escape para cerrar
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				if (isOpen) {
					handleClose();
				} else {
					handleOpen();
				}
			}
			if (e.key === 'Escape' && isOpen) {
				e.preventDefault();
				handleClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, handleClose, handleOpen]);

	// Auto-focus en el input al abrir
	useEffect(() => {
		if (isOpen) {
			// Pequeño timeout para asegurar que el DOM esté listo
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Limpiar debounce timer al desmontar
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	// Clic en una requisición de la lista
	const handleSelectRequisicion = (req: RequisicionConRelaciones) => {
		handleClose();
		setSelectedReq(req);
		setIsDetailOpen(true);
	};

	// Bloquear scroll de la página de fondo cuando el buscador está abierto
	useEffect(() => {
		if (isOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isOpen]);

	return (
		<>
			{/* Botón activador en la barra de navegación */}
			<button
				type="button"
				onClick={handleOpen}
				className="h-9 px-3 w-36 sm:w-52 md:w-64 rounded-md flex items-center justify-between gap-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-medium"
				title="Buscar requisición (Ctrl+K)"
				aria-label="Buscar requisiciones"
			>
				<div className="flex items-center gap-2 truncate">
					<Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
					<span className="truncate">Buscar...</span>
				</div>
				<kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-zinc-500 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/80 rounded select-none">
					Ctrl + K
				</kbd>
			</button>

			{/* Modal / Command Palette de Búsqueda teletransportado al body para desenfocar toda la pantalla */}
			{isOpen &&
				typeof document !== 'undefined' &&
				createPortal(
					<div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 px-4 animate-in fade-in-0 duration-150">
						<div
							ref={searchModalRef}
							className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-md border border-slate-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
						>
							{/* Barra de entrada de búsqueda */}
							<div className="flex items-center px-4 py-1 border-b border-slate-100 dark:border-zinc-800">
								<Search className="w-4 h-4 text-slate-400 shrink-0" />
								<input
									ref={inputRef}
									type="text"
									value={query}
									onChange={(e) => handleQueryChange(e.target.value)}
									placeholder="Buscar por código, justificación, proveedor..."
									className="w-full py-3 px-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
								/>
								{isLoading && (
									<Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0 mr-1" />
								)}
								{query && !isLoading && (
									<button
										type="button"
										onClick={() => handleQueryChange('')}
										className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
										title="Limpiar búsqueda"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								)}
							</div>

							{/* Encabezado y Lista de Resultados */}
							<div className="p-2 max-h-80 sm:max-h-96 overflow-y-auto">
								<div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
									{query.trim() ? 'Resultados' : 'Recientes'}
								</div>

								{results.length > 0 ? (
									<div className="space-y-0.5 mt-1">
										{results.map((req) => (
											<button
												key={req.id}
												type="button"
												onClick={() => handleSelectRequisicion(req)}
												className="w-full flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors text-left group cursor-pointer"
											>
												{/* Icono + Información de la Requisición */}
												<div className="flex items-center gap-3 min-w-0 flex-1">
													<div className="w-8 h-8 rounded-md bg-[#035786]/10 dark:bg-[#035786]/20 flex items-center justify-center shrink-0 text-[#035786] dark:text-blue-300 group-hover:bg-[#035786] group-hover:text-white transition-colors">
														<FileText className="w-4 h-4" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums truncate group-hover:text-[#035786] dark:group-hover:text-blue-400 transition-colors">
															{req.numero || 'Borrador'}
														</p>
														<p className="text-xs text-slate-500 dark:text-slate-400 truncate">
															{req.justificacion || 'Sin justificación'}
														</p>
													</div>
												</div>

												{/* Badge de Estado */}
												<EstadoBadge
													estado={req.estado}
													className="shrink-0 text-[11px]"
												/>
											</button>
										))}
									</div>
								) : !isLoading ? (
									<div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
										{query.trim()
											? `No se encontraron requisiciones que coincidan con "${query}"`
											: 'No hay requisiciones recientes disponibles'}
									</div>
								) : null}
							</div>
						</div>
					</div>,
					document.body,
				)}

			{/* Modal de Detalle al hacer clic en un resultado */}
			{selectedReq && (
				<RequisicionDetalleModal
					requisicion={selectedReq}
					open={isDetailOpen}
					onClose={() => {
						setIsDetailOpen(false);
						setSelectedReq(null);
					}}
				/>
			)}
		</>
	);
}

'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
	Bell,
	CheckCircle2,
	Clock,
	XCircle,
	RotateCcw,
	Send,
	Check,
	Loader2,
	Inbox,
} from 'lucide-react';
import {
	getMisNotificaciones,
	marcarNotificacionLeida,
	marcarTodasNotificacionesLeidas,
	getRequisicionParaModal,
} from '@/actions/notificaciones';
import { RequisicionDetalleModal } from '@/components/requisiciones/RequisicionDetalleModal';
import type { RequisicionConRelaciones } from '@/types/requisicion';

interface NotificacionItem {
	id: number;
	usuarioId: number;
	requisicionId: number | null;
	mensaje: string;
	leida: boolean;
	fecha: string;
	requisicion?: {
		id: number;
		numero: string | null;
		estado: string;
	} | null;
}

function formatTiempoRelativo(dateString: string | Date): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSec < 60) return 'Hace un momento';
	if (diffMin < 60) return `Hace ${diffMin} min`;
	if (diffHours < 24) return `Hace ${diffHours} h`;
	if (diffDays === 1) return 'Ayer';
	if (diffDays < 7) return `Hace ${diffDays} días`;
	return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
}

function getIconForMessage(mensaje: string) {
	const lower = mensaje.toLowerCase();
	if (
		lower.includes('aprobada') ||
		lower.includes('completada') ||
		lower.includes('atendida')
	) {
		return {
			icon: CheckCircle2,
			bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
			textColor: 'text-emerald-600 dark:text-emerald-400',
		};
	}
	if (lower.includes('compra') || lower.includes('proceso')) {
		return {
			icon: Clock,
			bgColor: 'bg-blue-50 dark:bg-blue-950/60',
			textColor: 'text-blue-600 dark:text-blue-400',
		};
	}
	if (lower.includes('rechazada')) {
		return {
			icon: XCircle,
			bgColor: 'bg-rose-50 dark:bg-rose-950/60',
			textColor: 'text-rose-600 dark:text-rose-400',
		};
	}
	if (lower.includes('devuelta') || lower.includes('corrección')) {
		return {
			icon: RotateCcw,
			bgColor: 'bg-amber-50 dark:bg-amber-950/60',
			textColor: 'text-amber-600 dark:text-amber-400',
		};
	}
	return {
		icon: Send,
		bgColor: 'bg-[#301996]/10 dark:bg-[#301996]/25',
		textColor: 'text-[#301996] dark:text-[#6a9bcc]',
	};
}

export function NotificationDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
	const [totalNoLeidas, setTotalNoLeidas] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [, startTransition] = useTransition();

	// Modal de detalle de la requisición seleccionada
	const [selectedReq, setSelectedReq] =
		useState<RequisicionConRelaciones | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoadingReq, setIsLoadingReq] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	// Función para cargar notificaciones desde el servidor
	const cargarNotificaciones = async () => {
		try {
			setIsLoading(true);
			const res = await getMisNotificaciones();
			if (res.success && res.notificaciones) {
				setNotificaciones(res.notificaciones as unknown as NotificacionItem[]);
				setTotalNoLeidas(res.totalNoLeidas || 0);
			}
		} catch (error) {
			console.error('Error al cargar notificaciones:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Cargar al montar el componente de manera asíncrona
	useEffect(() => {
		let isMounted = true;
		getMisNotificaciones().then((res) => {
			if (isMounted && res.success && res.notificaciones) {
				setNotificaciones(res.notificaciones as unknown as NotificacionItem[]);
				setTotalNoLeidas(res.totalNoLeidas || 0);
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	// Cerrar dropdown al hacer clic afuera
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Al abrir el dropdown, refrescar notificaciones para ver siempre datos frescos
	const toggleOpen = () => {
		const nextState = !isOpen;
		setIsOpen(nextState);
		if (nextState) {
			cargarNotificaciones();
		}
	};

	// Marcar todas como leídas
	const handleMarcarTodasLeidas = () => {
		if (totalNoLeidas === 0) return;

		setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
		setTotalNoLeidas(0);

		startTransition(async () => {
			await marcarTodasNotificacionesLeidas();
		});
	};

	// Clic en una notificación individual
	const handleNotificationClick = async (notif: NotificacionItem) => {
		// 1. Marcar como leída de forma optimista
		if (!notif.leida) {
			setNotificaciones((prev) =>
				prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n)),
			);
			setTotalNoLeidas((prev) => Math.max(0, prev - 1));

			startTransition(async () => {
				await marcarNotificacionLeida(notif.id);
			});
		}

		// 2. Si tiene requisición vinculada, abrir modal con su detalle
		if (notif.requisicionId) {
			setIsOpen(false);
			try {
				setIsLoadingReq(true);
				const res = await getRequisicionParaModal(notif.requisicionId);
				if (res.success && res.requisicion) {
					setSelectedReq(res.requisicion);
					setIsModalOpen(true);
				}
			} catch (error) {
				console.error('Error al abrir detalle de requisición:', error);
			} finally {
				setIsLoadingReq(false);
			}
		}
	};

	return (
		<>
			<div className="relative" ref={dropdownRef}>
				{/* Botón de la campana */}
				<button
					onClick={toggleOpen}
					className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors relative cursor-pointer active:scale-95"
					title="Notificaciones del sistema"
					aria-label="Notificaciones"
					aria-expanded={isOpen}
				>
					<Bell className="w-4 h-4" />

					{/* Badge indicador con contador o punto */}
					{totalNoLeidas > 0 && (
						<span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-[#301996] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-in zoom-in duration-200">
							{totalNoLeidas > 9 ? '9+' : totalNoLeidas}
						</span>
					)}
				</button>

				{/* Menú flotante Popover */}
				{isOpen && (
					<div className="absolute right-0 mt-3 w-80 sm:w-92 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800 p-4 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
						{/* Encabezado */}
						<div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-slate-900 dark:text-white">
									Notificaciones
								</span>
								{totalNoLeidas > 0 ? (
									<span className="text-[10px] bg-[#301996]/10 text-[#301996] dark:bg-[#301996]/30 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
										{totalNoLeidas} {totalNoLeidas === 1 ? 'nueva' : 'nuevas'}
									</span>
								) : (
									<span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full">
										Al día
									</span>
								)}
							</div>

							{totalNoLeidas > 0 && (
								<button
									onClick={handleMarcarTodasLeidas}
									className="text-[11px] text-[#301996] dark:text-[#6a9bcc] hover:underline flex items-center gap-1 cursor-pointer font-medium"
								>
									<Check className="w-3 h-3" />
									Marcar leídas
								</button>
							)}
						</div>

						{/* Lista de Notificaciones */}
						<div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 pt-1">
							{isLoading && notificaciones.length === 0 ? (
								<div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
									<Loader2 className="w-5 h-5 animate-spin text-[#301996]" />
									<span>Cargando notificaciones...</span>
								</div>
							) : notificaciones.length === 0 ? (
								<div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-center">
									<div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
										<Inbox className="w-5 h-5" />
									</div>
									<p className="text-xs font-medium text-slate-600 dark:text-slate-300">
										Sin notificaciones
									</p>
									<p className="text-[11px] text-slate-400 max-w-50">
										Te avisaremos cuando haya actualizaciones sobre tus
										requisiciones.
									</p>
								</div>
							) : (
								notificaciones.map((notif) => {
									const iconStyle = getIconForMessage(notif.mensaje);
									const IconComp = iconStyle.icon;

									return (
										<div
											key={notif.id}
											onClick={() => handleNotificationClick(notif)}
											className={`flex items-start gap-3 py-2.5 px-2 rounded-xl transition-all text-left cursor-pointer group ${
												!notif.leida
													? 'bg-slate-50/90 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800/70'
													: 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 opacity-80 hover:opacity-100'
											}`}
										>
											{/* Icono contextual */}
											<div
												className={`w-7 h-7 rounded-lg ${iconStyle.bgColor} ${iconStyle.textColor} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
											>
												<IconComp className="w-4 h-4" />
											</div>

											{/* Contenido (solo mensaje y fecha) */}
											<div className="space-y-1 min-w-0 flex-1">
												<p
													className={`text-xs leading-relaxed ${
														!notif.leida
															? 'font-medium text-slate-900 dark:text-slate-100'
															: 'text-slate-600 dark:text-slate-300'
													}`}
												>
													{notif.mensaje}
												</p>

												<div className="flex items-center gap-2">
													<span className="text-[10px] text-slate-400 font-normal">
														{formatTiempoRelativo(notif.fecha)}
													</span>

													{notif.requisicionId && (
														<span className="text-[10px] text-[#301996] dark:text-[#6a9bcc] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
															Ver requisición &rarr;
														</span>
													)}
												</div>
											</div>

											{/* Indicador de no leída */}
											{!notif.leida && (
												<span
													className="w-2 h-2 rounded-full bg-[#301996] shrink-0 mt-2"
													title="No leída"
												/>
											)}
										</div>
									);
								})
							)}
						</div>
					</div>
				)}
			</div>

			{/* Modal de Detalle al hacer clic en una notificación */}
			{selectedReq && (
				<RequisicionDetalleModal
					requisicion={selectedReq}
					open={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedReq(null);
					}}
				/>
			)}

			{/* Indicador de carga cuando se está solicitando el detalle de la requisición */}
			{isLoadingReq && (
				<div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-50 flex items-center justify-center">
					<div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200 dark:border-zinc-800">
						<Loader2 className="w-5 h-5 animate-spin text-[#301996]" />
						<span className="text-xs font-medium text-slate-700 dark:text-slate-300">
							Cargando requisición...
						</span>
					</div>
				</div>
			)}
		</>
	);
}

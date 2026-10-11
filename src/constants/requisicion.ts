import type { EstadoRequisicion } from '@prisma/client';

export interface EstadoFilterOption {
	value: string;
	label: string;
}

/**
 * Mapeo centralizado de estados de requisición a etiquetas amigables para la interfaz.
 */
export const ESTADO_REQUISICION_LABELS: Record<EstadoRequisicion | 'TODOS', string> = {
	TODOS: 'Todos los estados',
	BORRADOR: 'Borrador',
	PENDIENTE_APROBACION: 'En Aprobación',
	DEVUELTA: 'Devuelta',
	RECHAZADA: 'Rechazada',
	APROBADA: 'Aprobada',
	EN_COMPRA: 'En Compra',
	ATENDIDA: 'Atendida',
	CANCELADA: 'Cancelada',
};

/**
 * Obtiene la etiqueta legible de un estado de requisición de manera segura.
 */
export function getEstadoLabel(estado: string | null | undefined): string {
	if (!estado) return '';
	return (
		ESTADO_REQUISICION_LABELS[estado as keyof typeof ESTADO_REQUISICION_LABELS] ||
		estado
	);
}

/**
 * Función utilitaria para construir listas de opciones para los selectores de filtro.
 */
export function createFilterOptions(
	estados: (EstadoRequisicion | 'TODOS')[],
): EstadoFilterOption[] {
	return estados.map((value) => ({
		value,
		label: getEstadoLabel(value),
	}));
}

/**
 * Opciones de filtro para el Dashboard general de Requisiciones.
 */
export const ESTADOS_FILTRO_DASHBOARD: EstadoFilterOption[] = createFilterOptions([
	'TODOS',
	'BORRADOR',
	'PENDIENTE_APROBACION',
	'APROBADA',
	'DEVUELTA',
	'EN_COMPRA',
	'ATENDIDA',
	'CANCELADA',
]);

/**
 * Opciones de filtro para la bandeja del departamento de Compras (RF-16: Aprobadas, En Compra, Atendidas).
 */
export const ESTADOS_FILTRO_COMPRAS: EstadoFilterOption[] = createFilterOptions([
	'TODOS',
	'APROBADA',
	'EN_COMPRA',
	'ATENDIDA',
]);

/**
 * Opciones de filtro para el panel de Administración.
 */
export const ESTADOS_FILTRO_ADMIN: EstadoFilterOption[] = createFilterOptions([
	'TODOS',
	'BORRADOR',
	'PENDIENTE_APROBACION',
	'APROBADA',
	'DEVUELTA',
	'EN_COMPRA',
	'ATENDIDA',
	'RECHAZADA',
	'CANCELADA',
]);

import type { EstadoRequisicion, TipoRequisicion, Prioridad } from '@prisma/client';

export interface RequisicionItemDetalle {
	id: number;
	requisicionId?: number;
	descripcion: string;
	cantidad: number | string;
	unidad: string;
	costoEstimado?: number | string | null;
}

export interface HistorialDetalle {
	id: number;
	requisicionId: number;
	estadoAnterior: EstadoRequisicion | null;
	estadoNuevo: EstadoRequisicion;
	usuarioId: number;
	comentario: string | null;
	fecha: string | Date;
	usuario?: {
		nombre: string;
		usuario: string;
		rol?: string;
	} | null;
}

export interface ComprasDatosDetalle {
	id: number;
	requisicionId: number;
	proveedor: string;
	numeroOrdenCompra: string;
	costoFinal: number | string;
	fechaEntregaEstimada: string | Date | null;
	createdAt: string | Date;
}

export interface RequisicionConRelaciones {
	id: number;
	numero: string | null;
	solicitanteId?: number;
	departamentoId?: number;
	tipo: TipoRequisicion | string;
	prioridad: Prioridad | string;
	fechaRequerida: string | Date;
	justificacion: string;
	estado: EstadoRequisicion | string;
	fechaEnvio?: string | Date | null;
	createdAt?: string | Date;
	updatedAt?: string | Date;
	items: RequisicionItemDetalle[];
	departamento?: {
		id?: number;
		nombre: string;
	} | null;
	solicitante?: {
		id?: number;
		nombre: string;
		usuario: string;
	} | null;
	historial?: HistorialDetalle[];
	comprasDatos?: ComprasDatosDetalle | null;
}

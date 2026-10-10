import type { EstadoRequisicion, TipoRequisicion, Prioridad } from '@prisma/client';

export interface RequisicionItemDetalle {
	id: number;
	requisicionId?: number;
	descripcion: string;
	cantidad: number | string;
	unidad: string;
	costoEstimado?: number | string | null;
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
		nombre: string;
		usuario: string;
	} | null;
}

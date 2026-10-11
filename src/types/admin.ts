import type { Rol } from '@prisma/client';

export interface UsuarioAdmin {
	id: number;
	usuario: string;
	nombre: string;
	correo: string;
	rol: Rol;
	activo: boolean;
	departamentoId: number;
	departamento: {
		id: number;
		nombre: string;
	};
	createdAt: string | Date;
}

export interface DepartamentoSimple {
	id: number;
	nombre: string;
}

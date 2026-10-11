'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import {
	crearUsuarioSchema,
	editarUsuarioSchema,
	type CrearUsuarioInput,
	type EditarUsuarioInput,
} from '@/schemas/usuario.schema';
import {
	crearDepartamentoSchema,
	editarDepartamentoSchema,
	type CrearDepartamentoInput,
	type EditarDepartamentoInput,
} from '@/schemas/departamento.schema';

/**
 * Obtener todas las requisiciones, usuarios, departamentos y estadísticas globales para el módulo de Administración
 */
export async function getAdminDashboardData() {
	const session = await auth();
	if (!session?.user) {
		throw new Error('No autenticado');
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		throw new Error('Acceso restringido para Administradores');
	}

	// 1. Obtener todas las requisiciones con relaciones completas
	const requisiciones = await db.requisicion.findMany({
		include: {
			items: true,
			departamento: true,
			solicitante: {
				select: { id: true, nombre: true, usuario: true },
			},
			historial: {
				include: {
					usuario: {
						select: { nombre: true, usuario: true, rol: true },
					},
				},
				orderBy: {
					fecha: 'asc',
				},
			},
			comprasDatos: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	// 2. Obtener todos los usuarios con su departamento
	const usuarios = await db.usuario.findMany({
		select: {
			id: true,
			usuario: true,
			nombre: true,
			correo: true,
			rol: true,
			activo: true,
			departamentoId: true,
			departamento: {
				select: { id: true, nombre: true },
			},
			createdAt: true,
		},
		orderBy: {
			id: 'asc',
		},
	});

	// 3. Obtener todos los departamentos con recuento de usuarios y requisiciones asociadas
	const departamentos = await db.departamento.findMany({
		select: {
			id: true,
			nombre: true,
			activo: true,
			createdAt: true,
			_count: {
				select: {
					usuarios: true,
					requisiciones: true,
				},
			},
		},
		orderBy: {
			nombre: 'asc',
		},
	});

	// 4. Conteo de usuarios y departamentos activos
	const [totalUsuarios, totalDepartamentos] = await Promise.all([
		db.usuario.count({ where: { activo: true } }),
		db.departamento.count({ where: { activo: true } }),
	]);

	// 5. Monto total en compras
	const totalMontoCompras = await db.comprasDatos.aggregate({
		_sum: {
			costoFinal: true,
		},
	});

	return {
		requisiciones,
		usuarios,
		departamentos,
		metricas: {
			totalRequisiciones: requisiciones.length,
			totalUsuarios,
			totalDepartamentos,
			totalMontoCompras: Number(totalMontoCompras._sum.costoFinal || 0),
		},
	};
}

/**
 * Crear un nuevo usuario en el sistema con contraseña asignada por el Administrador
 */
export async function crearUsuarioAction(data: CrearUsuarioInput) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const validation = crearUsuarioSchema.safeParse(data);
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || 'Datos del usuario inválidos',
		};
	}

	const { usuario, nombre, correo, password, rol, departamentoId, activo } =
		validation.data;
	const normalizedUsuario = usuario.toLowerCase().trim();
	const normalizedCorreo = correo.toLowerCase().trim();

	// Verificar si ya existe usuario o correo
	const existingUser = await db.usuario.findFirst({
		where: {
			OR: [
				{ usuario: { equals: normalizedUsuario, mode: 'insensitive' } },
				{ correo: { equals: normalizedCorreo, mode: 'insensitive' } },
			],
		},
	});

	if (existingUser) {
		if (existingUser.usuario.toLowerCase() === normalizedUsuario) {
			return {
				success: false,
				error: 'El nombre de usuario ya está registrado en el sistema',
			};
		}
		return {
			success: false,
			error: 'El correo electrónico ya está registrado en el sistema',
		};
	}

	// Verificar que el departamento exista
	const depto = await db.departamento.findUnique({
		where: { id: departamentoId },
	});
	if (!depto) {
		return { success: false, error: 'El departamento seleccionado no existe' };
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const nuevoUsuario = await db.usuario.create({
		data: {
			usuario: normalizedUsuario,
			nombre: nombre.trim(),
			correo: normalizedCorreo,
			password: hashedPassword,
			rol,
			departamentoId,
			activo: activo ?? true,
		},
	});

	revalidatePath('/admin');
	return { success: true, id: nuevoUsuario.id };
}

/**
 * Editar usuario existente (permite modificar datos, departamento, rol, estado y opcionalmente resetear password)
 */
export async function editarUsuarioAction(data: EditarUsuarioInput) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const validation = editarUsuarioSchema.safeParse(data);
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || 'Datos del usuario inválidos',
		};
	}

	const { id, usuario, nombre, correo, password, rol, departamentoId, activo } =
		validation.data;
	const currentUserId = parseInt(session.user.id, 10);

	const targetUser = await db.usuario.findUnique({
		where: { id },
	});
	if (!targetUser) {
		return { success: false, error: 'Usuario no encontrado' };
	}

	// Protección para el propio usuario administrador logueado
	if (currentUserId === id) {
		if (rol !== 'ADMINISTRADOR') {
			return {
				success: false,
				error: 'No puedes cambiar tu propio rol de Administrador',
			};
		}
		if (activo === false) {
			return {
				success: false,
				error: 'No puedes inactivar tu propia cuenta de Administrador',
			};
		}
	}

	const normalizedUsuario = usuario.toLowerCase().trim();
	const normalizedCorreo = correo.toLowerCase().trim();

	// Verificar colisiones de usuario o correo con otros usuarios
	const duplicate = await db.usuario.findFirst({
		where: {
			AND: [
				{ id: { not: id } },
				{
					OR: [
						{ usuario: { equals: normalizedUsuario, mode: 'insensitive' } },
						{ correo: { equals: normalizedCorreo, mode: 'insensitive' } },
					],
				},
			],
		},
	});

	if (duplicate) {
		if (duplicate.usuario.toLowerCase() === normalizedUsuario) {
			return {
				success: false,
				error: 'El nombre de usuario ya está en uso por otro registro',
			};
		}
		return {
			success: false,
			error: 'El correo electrónico ya está en uso por otro registro',
		};
	}

	// Verificar que el departamento exista
	const depto = await db.departamento.findUnique({
		where: { id: departamentoId },
	});
	if (!depto) {
		return { success: false, error: 'El departamento seleccionado no existe' };
	}

	const updateData: {
		usuario: string;
		nombre: string;
		correo: string;
		rol: typeof rol;
		departamentoId: number;
		activo: boolean;
		password?: string;
	} = {
		usuario: normalizedUsuario,
		nombre: nombre.trim(),
		correo: normalizedCorreo,
		rol,
		departamentoId,
		activo,
	};

	if (password && password.trim().length >= 6) {
		updateData.password = await bcrypt.hash(password.trim(), 10);
	}

	await db.usuario.update({
		where: { id },
		data: updateData,
	});

	revalidatePath('/admin');
	return { success: true };
}

/**
 * Activar o inactivar un usuario (Soft delete / reactivación segura)
 */
export async function toggleEstadoUsuarioAction(id: number) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const currentUserId = parseInt(session.user.id, 10);
	if (currentUserId === id) {
		return {
			success: false,
			error: 'No puedes inactivar tu propia cuenta de Administrador',
		};
	}

	const targetUser = await db.usuario.findUnique({
		where: { id },
	});
	if (!targetUser) {
		return { success: false, error: 'Usuario no encontrado' };
	}

	const nuevoEstado = !targetUser.activo;

	await db.usuario.update({
		where: { id },
		data: { activo: nuevoEstado },
	});

	revalidatePath('/admin');
	return {
		success: true,
		activo: nuevoEstado,
		message: nuevoEstado
			? 'Usuario reactivado exitosamente'
			: 'Usuario inactivado exitosamente',
	};
}

/**
 * Crear un nuevo departamento
 */
export async function crearDepartamentoAction(data: CrearDepartamentoInput) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const validation = crearDepartamentoSchema.safeParse(data);
	if (!validation.success) {
		return {
			success: false,
			error:
				validation.error.issues[0]?.message ||
				'Datos del departamento inválidos',
		};
	}

	const { nombre, activo } = validation.data;
	const nombreTrimmed = nombre.trim();

	// Verificar nombre único
	const existing = await db.departamento.findFirst({
		where: {
			nombre: { equals: nombreTrimmed, mode: 'insensitive' },
		},
	});

	if (existing) {
		return {
			success: false,
			error: 'Ya existe un departamento con este nombre',
		};
	}

	const nuevoDepto = await db.departamento.create({
		data: {
			nombre: nombreTrimmed,
			activo: activo ?? true,
		},
	});

	revalidatePath('/admin');
	return { success: true, id: nuevoDepto.id };
}

/**
 * Editar departamento existente
 */
export async function editarDepartamentoAction(data: EditarDepartamentoInput) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const validation = editarDepartamentoSchema.safeParse(data);
	if (!validation.success) {
		return {
			success: false,
			error:
				validation.error.issues[0]?.message ||
				'Datos del departamento inválidos',
		};
	}

	const { id, nombre, activo } = validation.data;
	const nombreTrimmed = nombre.trim();

	const target = await db.departamento.findUnique({
		where: { id },
	});
	if (!target) {
		return { success: false, error: 'Departamento no encontrado' };
	}

	// Verificar colisión con otro departamento
	const duplicate = await db.departamento.findFirst({
		where: {
			id: { not: id },
			nombre: { equals: nombreTrimmed, mode: 'insensitive' },
		},
	});

	if (duplicate) {
		return {
			success: false,
			error: 'Ya existe otro departamento con este nombre',
		};
	}

	await db.departamento.update({
		where: { id },
		data: {
			nombre: nombreTrimmed,
			activo,
		},
	});

	revalidatePath('/admin');
	return { success: true };
}

/**
 * Activar o inactivar un departamento (Soft delete)
 */
export async function toggleEstadoDepartamentoAction(id: number) {
	const session = await auth();
	if (!session?.user) {
		return { success: false, error: 'No autenticado' };
	}

	if (session.user.rol !== 'ADMINISTRADOR') {
		return { success: false, error: 'Acceso restringido para Administradores' };
	}

	const target = await db.departamento.findUnique({
		where: { id },
	});
	if (!target) {
		return { success: false, error: 'Departamento no encontrado' };
	}

	const nuevoEstado = !target.activo;

	await db.departamento.update({
		where: { id },
		data: { activo: nuevoEstado },
	});

	revalidatePath('/admin');
	return {
		success: true,
		activo: nuevoEstado,
		message: nuevoEstado
			? 'Departamento reactivado exitosamente'
			: 'Departamento inactivado exitosamente',
	};
}

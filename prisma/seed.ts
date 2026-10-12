import 'dotenv/config';
import {
	PrismaClient,
	Rol,
	TipoRequisicion,
	Prioridad,
	EstadoRequisicion,
	Usuario,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log(
		'🌱 Iniciando seed completo de la base de datos (20 requisiciones)...',
	);

	// 1. Limpieza en orden inverso de dependencias para evitar errores de clave foránea
	console.log('🧹 Limpiando datos existentes...');
	await prisma.notificacion.deleteMany();
	await prisma.comprasDatos.deleteMany();
	await prisma.historial.deleteMany();
	await prisma.requisicionItem.deleteMany();
	await prisma.requisicion.deleteMany();
	await prisma.usuario.deleteMany();
	await prisma.departamento.deleteMany();
	await prisma.correlativoAnual.deleteMany();

	// 2. Departamentos (incluye uno inactivo para probar filtros/reactivación en Admin)
	const departamentosData = [
		{ nombre: 'Tecnología e Informática', activo: true },
		{ nombre: 'Operaciones y Logística', activo: true },
		{ nombre: 'Administración y Finanzas', activo: true },
		{ nombre: 'Recursos Humanos', activo: true },
		{ nombre: 'Compras y Suministros', activo: true },
		{ nombre: 'Mantenimiento e Infraestructura', activo: false },
	];

	const departamentos = [];
	for (const depto of departamentosData) {
		const d = await prisma.departamento.create({ data: depto });
		departamentos.push(d);
	}
	console.log(`✅ ${departamentos.length} departamentos creados.`);

	const depTecnologia = departamentos.find(
		(d) => d.nombre === 'Tecnología e Informática',
	)!;
	const depOperaciones = departamentos.find(
		(d) => d.nombre === 'Operaciones y Logística',
	)!;
	const depCompras = departamentos.find(
		(d) => d.nombre === 'Compras y Suministros',
	)!;
	const depRRHH = departamentos.find((d) => d.nombre === 'Recursos Humanos')!;

	// 3. Usuarios base con password 'password123'
	const defaultPassword = 'password123';
	const password = await bcrypt.hash(defaultPassword, 10);

	const usuariosData = [
		{
			usuario: 'admin',
			nombre: 'Administrador del Sistema',
			correo: 'admin@adaptapro.com',
			password,
			rol: Rol.ADMINISTRADOR,
			departamentoId: depTecnologia.id,
			activo: true,
		},
		{
			usuario: 'solicitante',
			nombre: 'Juan Perez',
			correo: 'solicitante@adaptapro.com',
			password,
			rol: Rol.SOLICITANTE,
			departamentoId: depOperaciones.id,
			activo: true,
		},
		{
			usuario: 'solicitante_ti',
			nombre: 'Ana Gomez',
			correo: 'ana.gomez@adaptapro.com',
			password,
			rol: Rol.SOLICITANTE,
			departamentoId: depTecnologia.id,
			activo: true,
		},
		{
			usuario: 'aprobador',
			nombre: 'María Jefa Operaciones',
			correo: 'aprobador@adaptapro.com',
			password,
			rol: Rol.APROBADOR,
			departamentoId: depOperaciones.id,
			activo: true,
		},
		{
			usuario: 'compras',
			nombre: 'Carlos Encargado Compras',
			correo: 'compras@adaptapro.com',
			password,
			rol: Rol.COMPRAS,
			departamentoId: depCompras.id,
			activo: true,
		},
		{
			usuario: 'inactivo',
			nombre: 'Pedro Inactivo',
			correo: 'inactivo@adaptapro.com',
			password,
			rol: Rol.SOLICITANTE,
			departamentoId: depRRHH.id,
			activo: false,
		},
	];

	const usuarios: Record<string, Usuario> = {};
	for (const user of usuariosData) {
		const u = await prisma.usuario.create({ data: user });
		usuarios[u.usuario] = u;
	}
	console.log(
		`✅ ${Object.keys(usuarios).length} usuarios creados (password para todos: '${defaultPassword}').`,
	);

	const anioActual = new Date().getFullYear();

	const sumarDias = (dias: number) => {
		const f = new Date();
		f.setDate(f.getDate() + dias);
		return f;
	};

	const restarDias = (dias: number) => {
		const f = new Date();
		f.setDate(f.getDate() - dias);
		return f;
	};

	console.log(
		'📦 Creando 20 requisiciones con items, historial y datos de compras...',
	);

	// --- 1. BORRADOR (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: null,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(15),
			justificacion:
				'Dotación de equipos de protección personal (EPP) y chalecos reflectivos para nuevos operadores de almacén.',
			estado: EstadoRequisicion.BORRADOR,
			fechaEnvio: null,
			items: {
				create: [
					{
						descripcion:
							'Chalecos de seguridad reflectantes de alta visibilidad',
						cantidad: 10,
						unidad: 'UNIDAD',
						costoEstimado: 15.0,
					},
					{
						descripcion: 'Cascos de seguridad industrial ANSI Z89',
						cantidad: 10,
						unidad: 'UNIDAD',
						costoEstimado: 25.5,
					},
					{
						descripcion: 'Guantes de carnaza reforzados',
						cantidad: 20,
						unidad: 'PAR',
						costoEstimado: 8.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.BORRADOR,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Borrador inicial guardado.',
						fecha: restarDias(1),
					},
				],
			},
		},
	});

	// --- 2. BORRADOR (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: null,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(10),
			justificacion:
				'Periféricos de repuesto: teclados ergonómicos, ratones ópticos inalámbricos y cables HDMI para estaciones de trabajo.',
			estado: EstadoRequisicion.BORRADOR,
			fechaEnvio: null,
			items: {
				create: [
					{
						descripcion: 'Teclado ergonómico USB Logitech K120',
						cantidad: 5,
						unidad: 'UNIDAD',
						costoEstimado: 18.0,
					},
					{
						descripcion: 'Mouse óptico inalámbrico Logitech M185',
						cantidad: 5,
						unidad: 'UNIDAD',
						costoEstimado: 14.5,
					},
					{
						descripcion: 'Cable HDMI 2.0 de alta velocidad 2 metros',
						cantidad: 10,
						unidad: 'UNIDAD',
						costoEstimado: 6.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.BORRADOR,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Borrador de periféricos TI guardado.',
						fecha: restarDias(2),
					},
				],
			},
		},
	});

	// --- 3. REQ-2026-0001: PENDIENTE_APROBACION (Juan Perez - Operaciones) ---
	const req1 = await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0001`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(10),
			justificacion:
				'Renovación de impresoras de etiquetas y rollos térmicos para despacho logístico.',
			estado: EstadoRequisicion.PENDIENTE_APROBACION,
			fechaEnvio: restarDias(2),
			items: {
				create: [
					{
						descripcion: 'Impresora térmica de etiquetas Zebra ZD220',
						cantidad: 2,
						unidad: 'UNIDAD',
						costoEstimado: 280.0,
					},
					{
						descripcion: 'Rollos de etiquetas térmicas autoadhesivas 100x150mm',
						cantidad: 30,
						unidad: 'ROLLO',
						costoEstimado: 6.5,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Requisición enviada a aprobación de jefatura.',
						fecha: restarDias(2),
					},
				],
			},
		},
	});

	// --- 4. REQ-2026-0002: PENDIENTE_APROBACION (Juan Perez - Operaciones - URGENTE) ---
	const req2 = await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0002`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.URGENTE,
			fechaRequerida: sumarDias(3),
			justificacion:
				'Reparación correctiva de emergencia del montacargas principal del muelle de carga (fuga hidráulica activa).',
			estado: EstadoRequisicion.PENDIENTE_APROBACION,
			fechaEnvio: restarDias(1),
			items: {
				create: [
					{
						descripcion:
							'Diagnóstico y cambio de mangueras de presión hidráulica montacargas Toyota',
						cantidad: 1,
						unidad: 'SERVICIO',
						costoEstimado: 450.0,
					},
					{
						descripcion: 'Aceite hidráulico industrial ISO 68',
						cantidad: 4,
						unidad: 'GALON',
						costoEstimado: 35.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Solicitud urgente por parada operativa en muelle.',
						fecha: restarDias(1),
					},
				],
			},
		},
	});

	// --- 5. REQ-2026-0003: PENDIENTE_APROBACION (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0003`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(8),
			justificacion:
				'Mantenimiento preventivo y limpieza de unidades de aire acondicionado para la sala de servidores (Datacenter).',
			estado: EstadoRequisicion.PENDIENTE_APROBACION,
			fechaEnvio: restarDias(2),
			items: {
				create: [
					{
						descripcion: 'Mantenimiento preventivo A/A de precisión Datacenter',
						cantidad: 2,
						unidad: 'SERVICIO',
						costoEstimado: 320.0,
					},
					{
						descripcion: 'Recarga de gas refrigerante ecológico R410A',
						cantidad: 1,
						unidad: 'SERVICIO',
						costoEstimado: 95.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación de gerencia técnica.',
						fecha: restarDias(2),
					},
				],
			},
		},
	});

	// --- 6. REQ-2026-0004: PENDIENTE_APROBACION (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0004`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(12),
			justificacion:
				'Cajas de cartón corrugado de doble pared para empaque y despacho de mercancía frágil.',
			estado: EstadoRequisicion.PENDIENTE_APROBACION,
			fechaEnvio: restarDias(3),
			items: {
				create: [
					{
						descripcion: 'Cajas doble pared reforzadas 40x40x40cm',
						cantidad: 200,
						unidad: 'UNIDAD',
						costoEstimado: 1.8,
					},
					{
						descripcion: 'Rollo de plástico de burbujas 1 metro x 100 metros',
						cantidad: 4,
						unidad: 'ROLLO',
						costoEstimado: 42.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(3),
					},
				],
			},
		},
	});

	// --- 7. REQ-2026-0005: DEVUELTA (Juan Perez - Operaciones) ---
	const req5 = await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0005`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(12),
			justificacion:
				'Adquisición de estanterías metálicas modulares para pasillo C.',
			estado: EstadoRequisicion.DEVUELTA,
			fechaEnvio: restarDias(5),
			items: {
				create: [
					{
						descripcion:
							'Estanterías industriales de acero 5 niveles 200kg por balda',
						cantidad: 4,
						unidad: 'UNIDAD',
						costoEstimado: 180.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(5),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.DEVUELTA,
						usuarioId: usuarios.aprobador.id,
						comentario:
							'Por favor verificar las medidas exactas del pasillo C antes de tramitar la compra.',
						fecha: restarDias(4),
					},
				],
			},
		},
	});

	// --- 8. REQ-2026-0006: DEVUELTA (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0006`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(14),
			justificacion:
				'Adquisición de switch de red capa 3 de 48 puertos para ampliación de conectividad de oficinas.',
			estado: EstadoRequisicion.DEVUELTA,
			fechaEnvio: restarDias(6),
			items: {
				create: [
					{
						descripcion:
							'Switch Administrable Cisco Catalyst 48 puertos Gigabit',
						cantidad: 1,
						unidad: 'UNIDAD',
						costoEstimado: 1250.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(6),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.DEVUELTA,
						usuarioId: usuarios.admin.id,
						comentario:
							'Por favor validar si el modelo cotizado cuenta con soporte PoE+ para los nuevos teléfonos IP.',
						fecha: restarDias(5),
					},
				],
			},
		},
	});

	// --- 9. REQ-2026-0007: RECHAZADA (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0007`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(20),
			justificacion:
				'Pintura decorativa e impermeabilización estética de fachada lateral del depósito.',
			estado: EstadoRequisicion.RECHAZADA,
			fechaEnvio: restarDias(8),
			items: {
				create: [
					{
						descripcion: 'Servicio de pintura general de exteriores',
						cantidad: 1,
						unidad: 'SERVICIO',
						costoEstimado: 850.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(8),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.RECHAZADA,
						usuarioId: usuarios.aprobador.id,
						comentario:
							'Rechazada por restricción presupuestaria en el trimestre. Solo se atienden solicitudes operativas críticas.',
						fecha: restarDias(7),
					},
				],
			},
		},
	});

	// --- 10. REQ-2026-0008: RECHAZADA (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0008`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(25),
			justificacion:
				'Smart TV de 75 pulgadas para monitoreo continuo en área de soporte técnico.',
			estado: EstadoRequisicion.RECHAZADA,
			fechaEnvio: restarDias(12),
			items: {
				create: [
					{
						descripcion: 'Pantalla Smart TV 75 pulgadas 4K UHD',
						cantidad: 1,
						unidad: 'UNIDAD',
						costoEstimado: 920.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(12),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.RECHAZADA,
						usuarioId: usuarios.admin.id,
						comentario:
							'Rechazada. Se dispone de un monitor de 55 pulgadas disponible en stock de almacén que puede reasignarse.',
						fecha: restarDias(10),
					},
				],
			},
		},
	});

	// --- 11. REQ-2026-0009: APROBADA (Juan Perez - Operaciones - URGENTE) ---
	const req9 = await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0009`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.URGENTE,
			fechaRequerida: sumarDias(7),
			justificacion:
				'Cintas de embalaje y plástico stretch para paletizado y protección de despachos.',
			estado: EstadoRequisicion.APROBADA,
			fechaEnvio: restarDias(4),
			items: {
				create: [
					{
						descripcion: 'Cinta de embalar transparente 48mm x 100m',
						cantidad: 48,
						unidad: 'UNIDAD',
						costoEstimado: 2.5,
					},
					{
						descripcion: 'Rollos de plástico film stretch calibre 50',
						cantidad: 12,
						unidad: 'ROLLO',
						costoEstimado: 18.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(4),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.aprobador.id,
						comentario:
							'Aprobada por jefatura. Proceder con compras prioritarias.',
						fecha: restarDias(3),
					},
				],
			},
		},
	});

	// --- 12. REQ-2026-0010: APROBADA (Ana Gomez - Tecnología - URGENTE) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0010`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.URGENTE,
			fechaRequerida: sumarDias(5),
			justificacion:
				'Renovación anual de certificados SSL wildcard y soporte en la nube AWS.',
			estado: EstadoRequisicion.APROBADA,
			fechaEnvio: restarDias(3),
			items: {
				create: [
					{
						descripcion: 'Certificado SSL Wildcard Sectigo 1 Año',
						cantidad: 1,
						unidad: 'LICENCIA',
						costoEstimado: 180.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(3),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.admin.id,
						comentario: 'Aprobada por gerencia de tecnología.',
						fecha: restarDias(2),
					},
				],
			},
		},
	});

	// --- 13. REQ-2026-0011: APROBADA (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0011`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(16),
			justificacion:
				'Báscula industrial digital para pesaje de bultos pesados en recepción de proveedores.',
			estado: EstadoRequisicion.APROBADA,
			fechaEnvio: restarDias(5),
			items: {
				create: [
					{
						descripcion:
							'Balanza industrial de plataforma digital capacidad 500kg',
						cantidad: 1,
						unidad: 'UNIDAD',
						costoEstimado: 340.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(5),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.aprobador.id,
						comentario: 'Aprobada para trámite regular de compras.',
						fecha: restarDias(4),
					},
				],
			},
		},
	});

	// --- 14. REQ-2026-0012: EN_COMPRA (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0012`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(14),
			justificacion:
				'Renovación de transpaleta manual para descarga de camiones en patio 1.',
			estado: EstadoRequisicion.EN_COMPRA,
			fechaEnvio: restarDias(10),
			items: {
				create: [
					{
						descripcion:
							'Transpaleta hidráulica manual 2.5 Toneladas ruedas de poliuretano',
						cantidad: 1,
						unidad: 'UNIDAD',
						costoEstimado: 420.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(10),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.aprobador.id,
						comentario: 'Aprobada.',
						fecha: restarDias(9),
					},
					{
						estadoAnterior: EstadoRequisicion.APROBADA,
						estadoNuevo: EstadoRequisicion.EN_COMPRA,
						usuarioId: usuarios.compras.id,
						comentario:
							'Orden de compra colocada al proveedor Maquinarias & Logística C.A.',
						fecha: restarDias(6),
					},
				],
			},
			comprasDatos: {
				create: {
					proveedor: 'Maquinarias & Logística C.A.',
					numeroOrdenCompra: `OC-${anioActual}-0104`,
					costoFinal: 395.0,
					fechaEntregaEstimada: sumarDias(5),
				},
			},
		},
	});

	// --- 15. REQ-2026-0013: EN_COMPRA (Ana Gomez - Tecnología - URGENTE) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0013`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.URGENTE,
			fechaRequerida: sumarDias(6),
			justificacion:
				'Discos de estado sólido SSD NVMe de alta velocidad para ampliación de servidor de base de datos principal.',
			estado: EstadoRequisicion.EN_COMPRA,
			fechaEnvio: restarDias(7),
			items: {
				create: [
					{
						descripcion: 'SSD NVMe 2TB Enterprise Kingston Data Center Series',
						cantidad: 4,
						unidad: 'UNIDAD',
						costoEstimado: 145.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(7),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.admin.id,
						comentario: 'Aprobada por prioridad de base de datos.',
						fecha: restarDias(6),
					},
					{
						estadoAnterior: EstadoRequisicion.APROBADA,
						estadoNuevo: EstadoRequisicion.EN_COMPRA,
						usuarioId: usuarios.compras.id,
						comentario: 'Orden de compra emitida a TechStore Soluciones C.A.',
						fecha: restarDias(4),
					},
				],
			},
			comprasDatos: {
				create: {
					proveedor: 'TechStore Soluciones C.A.',
					numeroOrdenCompra: `OC-${anioActual}-0112`,
					costoFinal: 580.0,
					fechaEntregaEstimada: sumarDias(2),
				},
			},
		},
	});

	// --- 16. REQ-2026-0014: EN_COMPRA (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0014`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(18),
			justificacion:
				'Servicio de calibración y certificación metrológica de pesas y balanzas operativas de planta.',
			estado: EstadoRequisicion.EN_COMPRA,
			fechaEnvio: restarDias(8),
			items: {
				create: [
					{
						descripcion:
							'Calibración y certificación metrológica acreditada SENCAMER',
						cantidad: 1,
						unidad: 'SERVICIO',
						costoEstimado: 290.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(8),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.aprobador.id,
						comentario: 'Aprobada.',
						fecha: restarDias(7),
					},
					{
						estadoAnterior: EstadoRequisicion.APROBADA,
						estadoNuevo: EstadoRequisicion.EN_COMPRA,
						usuarioId: usuarios.compras.id,
						comentario: 'Servicio programado con laboratorio acreditado.',
						fecha: restarDias(5),
					},
				],
			},
			comprasDatos: {
				create: {
					proveedor: 'Metrología y Calidad Industrial C.A.',
					numeroOrdenCompra: `OC-${anioActual}-0115`,
					costoFinal: 290.0,
					fechaEntregaEstimada: sumarDias(10),
				},
			},
		},
	});

	// --- 17. REQ-2026-0015: ATENDIDA (Juan Perez - Operaciones) ---
	const req15 = await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0015`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: restarDias(5),
			justificacion:
				'Insumos de limpieza y desinfección para oficinas y áreas comunes de operaciones.',
			estado: EstadoRequisicion.ATENDIDA,
			fechaEnvio: restarDias(20),
			items: {
				create: [
					{
						descripcion: 'Desinfectante multiusos bidón de 20 litros',
						cantidad: 4,
						unidad: 'BIDON',
						costoEstimado: 22.0,
					},
					{
						descripcion: 'Bolsas plásticas de basura reforzadas 100L',
						cantidad: 10,
						unidad: 'PAQUETE',
						costoEstimado: 12.5,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(20),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.aprobador.id,
						comentario: 'Aprobada.',
						fecha: restarDias(18),
					},
					{
						estadoAnterior: EstadoRequisicion.APROBADA,
						estadoNuevo: EstadoRequisicion.EN_COMPRA,
						usuarioId: usuarios.compras.id,
						comentario: 'Orden de compra tramitada.',
						fecha: restarDias(15),
					},
					{
						estadoAnterior: EstadoRequisicion.EN_COMPRA,
						estadoNuevo: EstadoRequisicion.ATENDIDA,
						usuarioId: usuarios.compras.id,
						comentario: 'Insumos recibidos conformes en almacén central.',
						fecha: restarDias(2),
					},
				],
			},
			comprasDatos: {
				create: {
					proveedor: 'Distribuidora de Limpieza Total C.A.',
					numeroOrdenCompra: `OC-${anioActual}-0089`,
					costoFinal: 213.0,
					fechaEntregaEstimada: restarDias(3),
				},
			},
		},
	});

	// --- 18. REQ-2026-0016: ATENDIDA (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0016`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: restarDias(8),
			justificacion:
				'Laptops para analistas de desarrollo de software y soporte técnico.',
			estado: EstadoRequisicion.ATENDIDA,
			fechaEnvio: restarDias(25),
			items: {
				create: [
					{
						descripcion: 'Laptop Dell Latitude 16GB RAM 512GB SSD Core i7',
						cantidad: 2,
						unidad: 'UNIDAD',
						costoEstimado: 1200.0,
					},
					{
						descripcion: 'Base refrigerante para laptop con 4 ventiladores USB',
						cantidad: 2,
						unidad: 'UNIDAD',
						costoEstimado: 25.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(25),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.APROBADA,
						usuarioId: usuarios.admin.id,
						comentario: 'Aprobada por gerencia.',
						fecha: restarDias(22),
					},
					{
						estadoAnterior: EstadoRequisicion.APROBADA,
						estadoNuevo: EstadoRequisicion.EN_COMPRA,
						usuarioId: usuarios.compras.id,
						comentario: 'Orden de compra colocada con Dell.',
						fecha: restarDias(18),
					},
					{
						estadoAnterior: EstadoRequisicion.EN_COMPRA,
						estadoNuevo: EstadoRequisicion.ATENDIDA,
						usuarioId: usuarios.compras.id,
						comentario:
							'Equipos recibidos, inventariados y configurados por TI.',
						fecha: restarDias(4),
					},
				],
			},
			comprasDatos: {
				create: {
					proveedor: 'Dell Technologies de Venezuela',
					numeroOrdenCompra: `OC-${anioActual}-0075`,
					costoFinal: 2450.0,
					fechaEntregaEstimada: restarDias(5),
				},
			},
		},
	});

	// --- 19. REQ-2026-0017: CANCELADA (Juan Perez - Operaciones) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0017`,
			solicitanteId: usuarios.solicitante.id,
			departamentoId: depOperaciones.id,
			tipo: TipoRequisicion.BIEN,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(30),
			justificacion:
				'Pizarras acrílicas magnéticas para sala de reuniones operativas.',
			estado: EstadoRequisicion.CANCELADA,
			fechaEnvio: restarDias(15),
			items: {
				create: [
					{
						descripcion: 'Pizarra acrílica 120x90cm con marco de aluminio',
						cantidad: 2,
						unidad: 'UNIDAD',
						costoEstimado: 45.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(15),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.CANCELADA,
						usuarioId: usuarios.solicitante.id,
						comentario:
							'Cancelada por el solicitante: se reutilizaron pizarras existentes del almacén 2.',
						fecha: restarDias(14),
					},
				],
			},
		},
	});

	// --- 20. REQ-2026-0018: CANCELADA (Ana Gomez - Tecnología) ---
	await prisma.requisicion.create({
		data: {
			numero: `REQ-${anioActual}-0018`,
			solicitanteId: usuarios.solicitante_ti.id,
			departamentoId: depTecnologia.id,
			tipo: TipoRequisicion.SERVICIO,
			prioridad: Prioridad.NORMAL,
			fechaRequerida: sumarDias(20),
			justificacion:
				'Suscripción anual a plataforma externa de formularios y encuestas de satisfacción.',
			estado: EstadoRequisicion.CANCELADA,
			fechaEnvio: restarDias(16),
			items: {
				create: [
					{
						descripcion: 'Suscripción Anual Plan Business Typeform',
						cantidad: 1,
						unidad: 'LICENCIA',
						costoEstimado: 350.0,
					},
				],
			},
			historial: {
				create: [
					{
						estadoAnterior: null,
						estadoNuevo: EstadoRequisicion.PENDIENTE_APROBACION,
						usuarioId: usuarios.solicitante_ti.id,
						comentario: 'Enviada a aprobación.',
						fecha: restarDias(16),
					},
					{
						estadoAnterior: EstadoRequisicion.PENDIENTE_APROBACION,
						estadoNuevo: EstadoRequisicion.CANCELADA,
						usuarioId: usuarios.solicitante_ti.id,
						comentario:
							'Cancelada por la solicitante: se implementó solución interna con Next.js y base de datos propia.',
						fecha: restarDias(15),
					},
				],
			},
		},
	});

	console.log(
		'✅ 20 requisiciones sembradas cubriendo todos los estados y flujos.',
	);

	// 4. Inicializar correlativo en el último número utilizado (0018)
	await prisma.correlativoAnual.create({
		data: {
			anio: anioActual,
			ultimo: 18,
		},
	});
	console.log(
		`✅ Correlativo anual para ${anioActual} inicializado en 18 (próximo será REQ-${anioActual}-0019).`,
	);

	// 5. Notificaciones de prueba para validar la campana y dropdown del Navbar
	const notificacionesData = [
		// Para Juan Perez (Solicitante)
		{
			usuarioId: usuarios.solicitante.id,
			requisicionId: req5.id,
			mensaje: `Tu requisición ${req5.numero} ha sido DEVUELTA para corrección.`,
			leida: false,
			fecha: restarDias(4),
		},
		{
			usuarioId: usuarios.solicitante.id,
			requisicionId: req9.id,
			mensaje: `Tu requisición ${req9.numero} ha sido APROBADA.`,
			leida: false,
			fecha: restarDias(3),
		},
		{
			usuarioId: usuarios.solicitante.id,
			requisicionId: req15.id,
			mensaje: `Tu requisición ${req15.numero} ha sido ATENDIDA por compras.`,
			leida: true,
			fecha: restarDias(2),
		},
		// Para María (Aprobador)
		{
			usuarioId: usuarios.aprobador.id,
			requisicionId: req2.id,
			mensaje: `Nueva requisición URGENTE ${req2.numero} pendiente de tu aprobación.`,
			leida: false,
			fecha: restarDias(1),
		},
		{
			usuarioId: usuarios.aprobador.id,
			requisicionId: req1.id,
			mensaje: `Nueva requisición ${req1.numero} pendiente de tu aprobación.`,
			leida: false,
			fecha: restarDias(2),
		},
		// Para Carlos (Compras)
		{
			usuarioId: usuarios.compras.id,
			requisicionId: req9.id,
			mensaje: `Requisición urgente ${req9.numero} aprobada y en espera de compra.`,
			leida: false,
			fecha: restarDias(3),
		},
	];

	for (const notif of notificacionesData) {
		await prisma.notificacion.create({ data: notif });
	}
	console.log(
		`✅ ${notificacionesData.length} notificaciones de prueba creadas.`,
	);

	console.log(
		'🚀 Seed completado exitosamente con 20 requisiciones de prueba.',
	);
}

main()
	.catch((e) => {
		console.error('❌ Error en seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});

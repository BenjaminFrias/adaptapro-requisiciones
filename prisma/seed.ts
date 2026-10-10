import "dotenv/config";
import { PrismaClient, Rol } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // 1. Limpiar datos existentes en orden inverso de dependencias
  await prisma.notificacion.deleteMany();
  await prisma.comprasDatos.deleteMany();
  await prisma.historial.deleteMany();
  await prisma.requisicionItem.deleteMany();
  await prisma.requisicion.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.departamento.deleteMany();
  await prisma.correlativoAnual.deleteMany();

  // 2. Departamentos base
  const departamentosData = [
    { nombre: "Tecnología e Informática" },
    { nombre: "Operaciones y Logística" },
    { nombre: "Administración y Finanzas" },
    { nombre: "Recursos Humanos" },
    { nombre: "Compras y Suministros" },
  ];

  const departamentos = [];
  for (const depto of departamentosData) {
    const d = await prisma.departamento.create({ data: depto });
    departamentos.push(d);
  }
  console.log(`✅ ${departamentos.length} departamentos creados.`);

  const depTecnologia = departamentos.find((d) => d.nombre === "Tecnología e Informática")!;
  const depOperaciones = departamentos.find((d) => d.nombre === "Operaciones y Logística")!;
  const depCompras = departamentos.find((d) => d.nombre === "Compras y Suministros")!;

  // 3. Usuarios base (uno por rol) con password 'password123'
  const defaultPassword = "password123";
  const password = await bcrypt.hash(defaultPassword, 10);

  const usuariosData = [
    {
      usuario: "admin",
      nombre: "Administrador del Sistema",
      correo: "admin@adaptapro.com",
      password,
      rol: Rol.ADMINISTRADOR,
      departamentoId: depTecnologia.id,
    },
    {
      usuario: "solicitante",
      nombre: "Juan Solicitante",
      correo: "solicitante@adaptapro.com",
      password,
      rol: Rol.SOLICITANTE,
      departamentoId: depOperaciones.id,
    },
    {
      usuario: "aprobador",
      nombre: "María Jefa Operaciones",
      correo: "aprobador@adaptapro.com",
      password,
      rol: Rol.APROBADOR,
      departamentoId: depOperaciones.id,
    },
    {
      usuario: "compras",
      nombre: "Carlos Encargado Compras",
      correo: "compras@adaptapro.com",
      password,
      rol: Rol.COMPRAS,
      departamentoId: depCompras.id,
    },
  ];

  for (const user of usuariosData) {
    await prisma.usuario.create({ data: user });
  }
  console.log(`✅ 4 usuarios creados (password para todos: '${defaultPassword}').`);

  // 4. Inicializar correlativo del año en curso
  const anioActual = new Date().getFullYear();
  await prisma.correlativoAnual.create({
    data: {
      anio: anioActual,
      ultimo: 0,
    },
  });
  console.log(`✅ Correlativo anual para ${anioActual} inicializado.`);

  console.log("🚀 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

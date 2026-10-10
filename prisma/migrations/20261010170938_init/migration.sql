-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SOLICITANTE', 'APROBADOR', 'COMPRAS', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoRequisicion" AS ENUM ('BIEN', 'SERVICIO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('NORMAL', 'URGENTE');

-- CreateEnum
CREATE TYPE "EstadoRequisicion" AS ENUM ('BORRADOR', 'PENDIENTE_APROBACION', 'DEVUELTA', 'RECHAZADA', 'APROBADA', 'EN_COMPRA', 'ATENDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'SOLICITANTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "departamento_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisiciones" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(20),
    "solicitante_id" INTEGER NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "tipo" "TipoRequisicion" NOT NULL,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'NORMAL',
    "fecha_requerida" DATE NOT NULL,
    "justificacion" TEXT NOT NULL,
    "estado" "EstadoRequisicion" NOT NULL DEFAULT 'BORRADOR',
    "fecha_envio" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisiciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisicion_items" (
    "id" SERIAL NOT NULL,
    "requisicion_id" INTEGER NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "unidad" VARCHAR(30) NOT NULL,
    "costo_estimado" DECIMAL(14,2),

    CONSTRAINT "requisicion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" SERIAL NOT NULL,
    "requisicion_id" INTEGER NOT NULL,
    "estado_anterior" "EstadoRequisicion",
    "estado_nuevo" "EstadoRequisicion" NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_datos" (
    "id" SERIAL NOT NULL,
    "requisicion_id" INTEGER NOT NULL,
    "proveedor" VARCHAR(150) NOT NULL,
    "numero_orden_compra" VARCHAR(50) NOT NULL,
    "costo_final" DECIMAL(14,2) NOT NULL,
    "fecha_entrega_estimada" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "requisicion_id" INTEGER,
    "mensaje" VARCHAR(255) NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correlativos_anuales" (
    "anio" INTEGER NOT NULL,
    "ultimo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "correlativos_anuales_pkey" PRIMARY KEY ("anio")
);

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "requisiciones_numero_key" ON "requisiciones"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "compras_datos_requisicion_id_key" ON "compras_datos"("requisicion_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisiciones" ADD CONSTRAINT "requisiciones_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisiciones" ADD CONSTRAINT "requisiciones_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicion_items" ADD CONSTRAINT "requisicion_items_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_datos" ADD CONSTRAINT "compras_datos_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_requisicion_id_fkey" FOREIGN KEY ("requisicion_id") REFERENCES "requisiciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

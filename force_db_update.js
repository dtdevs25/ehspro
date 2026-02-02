
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5432/ehspro?schema=public",
        },
    },
});

async function main() {
    console.log("Iniciando correção forçada do banco de dados...");

    try {
        // 1. Adicionar coluna modulos_permitidos
        console.log("Adicionando coluna modulos_permitidos...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "modulos_permitidos" TEXT[] DEFAULT ARRAY[]::TEXT[];`);

        // 2. Adicionar coluna usuario_pai_id
        console.log("Adicionando coluna usuario_pai_id...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "usuario_pai_id" TEXT;`);

        // 3. Tentar adicionar GESTOR ao enum (pode falhar se já existir, então envolvemos em try/catch silencioso)
        console.log("Atualizando Enum UserRole...");
        try {
            await prisma.$executeRawUnsafe(`ALTER TYPE "tipo_usuario" ADD VALUE IF NOT EXISTS 'GESTOR';`);
        } catch (e) {
            // Postgres antigo não suporta IF NOT EXISTS no ALTER TYPE, então tentamos sem
            try {
                await prisma.$executeRawUnsafe(`ALTER TYPE "tipo_usuario" ADD VALUE 'GESTOR';`);
            } catch (e2) {
                console.log("-> Aviso: Talvez GESTOR já exista ou não foi possível adicionar. Ignorando.");
            }
        }

        console.log("✅ Correção aplicada com sucesso! Tente logar novamente.");
    } catch (error) {
        console.error("❌ Erro fatal ao aplicar correção:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

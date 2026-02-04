
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    console.log('🔧 Fixing Database Schema via Prisma...');

    try {
        // Empresas
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "cep" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "logradouro" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "numero" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "bairro" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "cidade" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "estado" TEXT;`);
        console.log('✅ Updated table: empresas');

        // Filiais
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "cep" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "logradouro" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "numero" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "bairro" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "cidade" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "estado" TEXT;`);
        console.log('✅ Updated table: filiais');

    } catch (e) {
        console.error('❌ Failed to update schema:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();

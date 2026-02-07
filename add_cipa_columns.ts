
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding columns to cipa_mandatos...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "cipa_mandatos" ADD COLUMN IF NOT EXISTS "representante_empresa_id" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "cipa_mandatos" ADD COLUMN IF NOT EXISTS "presidente_cipa_id" TEXT;`);
        console.log("Columns added successfully.");
    } catch (e) {
        console.error("Error adding columns:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

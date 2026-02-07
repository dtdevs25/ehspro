
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking columns in cipa_mandatos...");

        // Add columns if they don't exist
        await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE "cipa_mandatos" ADD COLUMN "representante_empresa_id" TEXT;
        EXCEPTION
          WHEN duplicate_column THEN RAISE NOTICE 'column representante_empresa_id already exists';
        END;
        BEGIN
          ALTER TABLE "cipa_mandatos" ADD COLUMN "presidente_cipa_id" TEXT;
        EXCEPTION
          WHEN duplicate_column THEN RAISE NOTICE 'column presidente_cipa_id already exists';
        END;
      END $$;
    `);

        console.log("Columns ensured.");

        // Verify
        const result = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cipa_mandatos';
    `);
        console.log("Current columns:", result);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

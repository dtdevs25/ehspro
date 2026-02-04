
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceLink() {
    console.log("🔗 Forcing Link (RAW SQL MODE)...");

    try {
        // 1. Get first branch ID raw
        // Note: adjusting quoting for postgres
        const branches: any[] = await prisma.$queryRaw`SELECT id, "empresa_id", nome FROM filiais LIMIT 1`;

        if (!branches || branches.length === 0) {
            console.error("❌ No branches found (Raw SQL).");
            return;
        }

        const branch = branches[0];
        const branchId = branch.id;
        const companyId = branch.empresa_id; // Postgres column name usually lowercase/snake_case in query result? 
        // Actually prisma maps it. Let's assume standard casing returned by driver.

        console.log(`Found Branch: ${branch.nome} (ID: ${branchId})`);

        // 2. Update Collaborators
        const count = await prisma.$executeRawUnsafe(`
        UPDATE colaboradores 
        SET filial_id = '${branchId}', empresa_id = '${companyId}'
    `);

        console.log(`\n✅ SUCCESS! Forced update on ${count} collaborators.`);

    } catch (e) {
        console.error("❌ Error linking:", e);
    } finally {
        await prisma.$disconnect();
    }
}

forceLink();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceLinkSQL() {
    console.log("🇧🇷 Forçando vínculo via SQL Direto...");

    try {
        // Atualiza todos os colaboradores para a primeira filial encontrada
        // Usando subselect para não precisar ler antes
        const count = await prisma.$executeRawUnsafe(`
        UPDATE "colaboradores" 
        SET "filial_id" = (SELECT "id" FROM "filiais" LIMIT 1), 
            "empresa_id" = (SELECT "empresa_id" FROM "filiais" LIMIT 1)
        WHERE "filial_id" IS NULL OR "filial_id" = '';
    `);

        console.log(`\n✅ SUCESSO! ${count} colaboradores foram atualizados/vinculados.`);

    } catch (e) {
        console.error("❌ Erro ao vincular:", e);
    } finally {
        await prisma.$disconnect();
    }
}

forceLinkSQL();

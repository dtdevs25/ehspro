
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const c = await prisma.collaborator.findMany({ include: { branch: true } });
    console.log('Total Collaborators:', c.length);
    c.forEach(col => {
        console.log(`- ${col.name} (Status: ${col.status}) - Branch: ${col.branch?.name} (${col.branchId})`);
    });

    const b = await prisma.branch.findMany();
    console.log('\nBranches:');
    b.forEach(br => console.log(`- ${br.name} (${br.id})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

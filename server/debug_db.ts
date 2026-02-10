
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5432/ehspro?schema=public"
        }
    }
});

async function main() {
    console.log('Connecting...');

    // List Branches
    const branches = await prisma.branch.findMany({
        include: { company: true }
    });
    console.log('\n--- Branches ---');
    branches.forEach(b => {
        console.log(`Branch: ${b.name} (ID: ${b.id}) - Company: ${b.company.name}`);
    });

    // List Collaborators
    const collaborators = await prisma.collaborator.findMany({
        include: { branch: true }
    });

    console.log('\n--- Collaborators ---');
    console.log(`Total found: ${collaborators.length}`);

    const activeCollabs = collaborators.filter(c => c.status === 'ACTIVE');
    console.log(`Active found: ${activeCollabs.length}`);

    collaborators.forEach(c => {
        console.log(`- ${c.name} | Status: ${c.status} | BranchId: ${c.branchId}`);
    });
}

main()
    .catch(e => {
        console.error('Error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

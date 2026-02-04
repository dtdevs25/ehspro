
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUGGING DATABASE RELATIONS ---");

    // 1. Check Branches
    const branches = await prisma.branch.findMany({
        include: { company: true }
    });
    console.log(`\nFound ${branches.length} branches:`);
    branches.forEach(b => {
        console.log(`- Branch: "${b.name}" (ID: ${b.id})`);
        console.log(`  -> Company: "${b.company.name}" (ID: ${b.companyId}, CNPJ: ${b.company.cnpj})`);
    });

    // 2. Check Collaborators
    const collaborators = await prisma.collaborator.findMany({
        include: {
            branch: true,
            company: true
        }
    });

    console.log(`\nFound ${collaborators.length} collaborators:`);
    if (collaborators.length === 0) {
        console.log("!!! NO COLLABORATORS FOUND IN DB !!!");
    } else {
        collaborators.forEach(c => {
            console.log(`- Collab: ${c.name} (ID: ${c.id})`);
            console.log(`  -> Linked to Branch: ${c.branch ? c.branch.name : "NULL"} (ID: ${c.branchId})`);
            console.log(`  -> Linked to Company: ${c.company ? c.company.name : "NULL"} (ID: ${c.companyId})`);
        });
    }

    // 3. Match Check
    if (collaborators.length > 0 && branches.length > 0) {
        const firstCollab = collaborators[0];
        const matchingBranch = branches.find(b => b.id === firstCollab.branchId);
        console.log(`\nVerification for first collaborator (${firstCollab.name}):`);
        if (matchingBranch) {
            console.log(`SUCCESS: Linked Branch ID ${firstCollab.branchId} exists in Branch table.`);
        } else {
            console.log(`FAILURE: Linked Branch ID ${firstCollab.branchId} DOES NOT EXIST in Branch table.`);
        }
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

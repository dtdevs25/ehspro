
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const c = await prisma.collaborator.count();
    console.log('Count:', c);
    const all = await prisma.collaborator.findMany();
    console.log(all);
}
main().catch(console.error).finally(() => prisma.$disconnect());

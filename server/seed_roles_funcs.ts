
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_FUNCTIONS = [
    {
        name: 'Analista de RH',
        cbo: '2524-05',
        description: 'Responsável por processos de RH.'
    },
    {
        name: 'Técnico de Segurança',
        cbo: '3516-05',
        description: 'Responsável pela segurança do trabalho.'
    },
    {
        name: 'Engenheiro Civil',
        cbo: '2142-05',
        description: 'Responsável por obras e projetos.'
    },
    {
        name: 'Desenvolvedor Full Stack',
        cbo: '3171-10',
        description: 'Desenvolvimento de software.'
    }
];

const INITIAL_ROLES = [
    {
        name: 'Analista de RH Sênior',
        description: 'Analista com experiência.',
        functionName: 'Analista de RH' // To link
    },
    {
        name: 'Técnico de Segurança Pleno',
        description: 'Técnico de campo.',
        functionName: 'Técnico de Segurança'
    },
    {
        name: 'Engenheiro Coordenador',
        description: 'Coordena equipe de engenharia.',
        functionName: 'Engenheiro Civil'
    },
    {
        name: 'Dev Lead',
        description: 'Lidera equipe de dev.',
        functionName: 'Desenvolvedor Full Stack'
    }
];

async function main() {
    console.log('Seeding Functions and Roles...');

    // 1. Create Functions
    const functionMap = new Map();

    for (const func of INITIAL_FUNCTIONS) {
        const existing = await prisma.jobFunction.findFirst({ where: { cbo: func.cbo } });
        if (!existing) {
            const created = await prisma.jobFunction.create({
                data: {
                    name: func.name,
                    cbo: func.cbo,
                    description: func.description,
                    registration: `F${Math.floor(Math.random() * 10000)}`
                }
            });
            functionMap.set(func.name, created.id);
            console.log(`Created Function: ${func.name}`);
        } else {
            functionMap.set(func.name, existing.id);
            console.log(`Function already exists: ${func.name}`);
        }
    }

    // 2. Create Roles
    for (const role of INITIAL_ROLES) {
        const fnId = functionMap.get(role.functionName);
        if (fnId) {
            const existing = await prisma.role.findFirst({ where: { name: role.name } });
            if (!existing) {
                await prisma.role.create({
                    data: {
                        name: role.name,
                        description: role.description,
                        functionId: fnId,
                        registration: `C${Math.floor(Math.random() * 10000)}`
                    }
                });
                console.log(`Created Role: ${role.name}`);
            } else {
                console.log(`Role already exists: ${role.name}`);
            }
        } else {
            console.warn(`Function not found for Role: ${role.name}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

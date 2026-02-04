
// Seed script using the running API
const API_URL = 'http://localhost:3000/api';

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
        functionName: 'Analista de RH'
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

async function seed() {
    console.log('Seeding via API...');

    try {
        // 1. Functions
        const functionMap = new Map();

        // Get existing to avoid duplicates
        try {
            const res = await fetch(`${API_URL}/functions`);
            if (res.ok) {
                const existing = await res.json();
                existing.forEach(f => functionMap.set(f.name, f.id));
            }
        } catch (e) {
            console.log('Could not fetch existing functions, assuming empty or server down.');
        }

        for (const func of INITIAL_FUNCTIONS) {
            if (!functionMap.has(func.name)) {
                const res = await fetch(`${API_URL}/functions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(func)
                });
                if (res.ok) {
                    const created = await res.json();
                    functionMap.set(created.name, created.id);
                    console.log(`Created Function: ${func.name}`);
                } else {
                    console.error(`Failed to create function ${func.name}: ${res.status}`);
                }
            } else {
                console.log(`Function exists: ${func.name}`);
            }
        }

        // 2. Roles
        // Get existing
        const existingRoles = new Set();
        try {
            const res = await fetch(`${API_URL}/roles`);
            if (res.ok) {
                const existing = await res.json();
                existing.forEach(r => existingRoles.add(r.name));
            }
        } catch (e) { }

        for (const role of INITIAL_ROLES) {
            if (!existingRoles.has(role.name)) {
                const fnId = functionMap.get(role.functionName);
                if (fnId) {
                    const res = await fetch(`${API_URL}/roles`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...role, functionId: fnId })
                    });
                    if (res.ok) {
                        console.log(`Created Role: ${role.name}`);
                    } else {
                        console.error(`Failed to create role ${role.name}: ${res.status}`);
                    }
                } else {
                    console.warn(`Parent function not found for role ${role.name}`);
                }
            } else {
                console.log(`Role exists: ${role.name}`);
            }
        }

        console.log('Done.');

    } catch (error) {
        console.error('Seeding failed. Is the server running on port 3000?', error);
    }
}

seed();

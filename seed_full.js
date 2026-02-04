
const API_URL = 'http://localhost:3000/api';

const COLLABORATORS = [
    { name: 'Ana Silva', cpf: '111.222.333-01', function: 'Analista de RH', role: 'Analista de RH Sênior', branch: 'Matriz' },
    { name: 'Beatriz Costa', cpf: '222.333.444-02', function: 'Analista de RH', role: 'Analista de RH Sênior', branch: 'Matriz' },
    { name: 'Carlos Oliveira', cpf: '333.444.555-03', function: 'Técnico de Segurança', role: 'Técnico de Segurança Pleno', branch: 'Planta Fabril' },
    { name: 'Daniel Souza', cpf: '444.555.666-04', function: 'Técnico de Segurança', role: 'Técnico de Segurança Pleno', branch: 'Planta Fabril' },
    { name: 'Eduardo Lima', cpf: '555.666.777-05', function: 'Engenheiro Civil', role: 'Engenheiro Coordenador', branch: 'Planta Fabril' },
    { name: 'Fernanda Santos', cpf: '666.777.888-06', function: 'Desenvolvedor Full Stack', role: 'Dev Lead', branch: 'Matriz' },
    { name: 'Gabriel Pereira', cpf: '777.888.999-07', function: 'Desenvolvedor Full Stack', role: 'Dev Lead', branch: 'Matriz' },
    { name: 'Helena Martins', cpf: '888.999.000-08', function: 'Engenheiro Civil', role: 'Engenheiro Coordenador', branch: 'Planta Fabril' },
    { name: 'Igor Alves', cpf: '999.000.111-09', function: 'Técnico de Segurança', role: 'Técnico de Segurança Pleno', branch: 'Matriz' },
    { name: 'Julia Rocha', cpf: '000.111.222-10', function: 'Analista de RH', role: 'Analista de RH Sênior', branch: 'Planta Fabril' }
];

async function seed() {
    console.log('🚀 Starting Full Seed via API...');

    try {
        // 1. Get Companies & Branches
        let branches = [];
        try {
            const res = await fetch(`${API_URL}/branches`);
            branches = await res.json();
        } catch (e) {
            console.error('❌ Error: Could not connect to API. Is the server running?');
            process.exit(1);
        }

        if (branches.length === 0) {
            console.error('❌ No branches found. Please run the initial seed or let the app create defaults.');
            process.exit(1);
        }

        const matriz = branches.find(b => b.name.toLowerCase().includes('matriz')) || branches[0];
        const planta = branches.find(b => b.name.toLowerCase().includes('planta')) || branches[1] || branches[0];
        const companyId = matriz.companyId;

        console.log(`🏢 Using Company ID: ${companyId}`);
        console.log(`📍 Using Branches: Matriz=${matriz.id}, Planta=${planta.id}`);

        // 2. Get/Create Functions & Roles
        // We assume they were created by the previous step, but we fetch them to get IDs
        const functionsRes = await fetch(`${API_URL}/functions`);
        const functions = await functionsRes.json();

        const rolesRes = await fetch(`${API_URL}/roles`);
        const roles = await rolesRes.json();

        // 3. Create Collaborators
        for (const [i, c] of COLLABORATORS.entries()) {
            const func = functions.find(f => f.name === c.function);
            const role = roles.find(r => r.name === c.role);
            const branch = c.branch === 'Matriz' ? matriz : planta;

            if (!func || !role) {
                console.warn(`⚠️ Skipping ${c.name}: Function or Role not found.`);
                continue;
            }

            const payload = {
                registration: (1000 + i + 1).toString(),
                name: c.name,
                cpf: c.cpf,
                rg: `RG-${c.cpf}`,
                motherName: 'Nome Mãe Exemplo',
                fatherName: 'Nome Pai Exemplo',
                birthDate: new Date('1990-01-01'),
                birthPlace: 'São Paulo',
                birthState: 'SP',
                nationality: 'Brasileira',
                education: 'Superior Completo',
                maritalStatus: 'Solteiro(a)',
                gender: 'Outro',
                race: 'Outra',
                address: 'Endereço Exemplo',
                phone: '11999999999',
                email: `${c.name.split(' ')[0].toLowerCase()}@exemplo.com`,
                roleId: role.id,
                functionId: func.id,
                companyId: companyId,
                branchId: branch.id,
                admissionDate: new Date(),
                status: 'ACTIVE',
                workRegime: 'EFFECTIVE'
            };

            const res = await fetch(`${API_URL}/collaborators`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log(`✅ Created: ${c.name}`);
            } else {
                const err = await res.json();
                console.log(`⚠️ Failed ${c.name}: ${err.error || res.statusText}`);
            }
        }

        console.log('🎉 Seed Completed!');

    } catch (e) {
        console.error('Fatal Error:', e);
    }
}

seed();

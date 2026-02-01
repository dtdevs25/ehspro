
import { ModuleType, MenuItem, User, Role, JobFunction, Company, Branch } from './types';

// Função auxiliar para ordenar submenus
const sortSubItems = (items: { id: string, label: string, component: string }[]) => 
  [...items].sort((a, b) => a.label.localeCompare(b.label));

export const MENU_CONFIG: MenuItem[] = [
  {
    id: 'admin',
    label: 'Administração',
    icon: 'Lock',
    module: ModuleType.ADMIN,
    subItems: sortSubItems([
      { id: 'settings', label: 'Configurações', component: 'Settings' },
      { id: 'users', label: 'Usuários e Acessos', component: 'UserPermissions' }
    ])
  },
  {
    id: 'registrations',
    label: 'Cadastros Gerais',
    icon: 'Archive',
    module: ModuleType.REGISTRATIONS,
    subItems: sortSubItems([
      { id: 'branches', label: 'Filiais', component: 'BranchManagement' },
      { id: 'companies', label: 'Empresas', component: 'CompanyManagement' }
    ])
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    module: ModuleType.DASHBOARD,
    subItems: sortSubItems([
      { id: 'overview', label: 'Visão Geral', component: 'DashboardOverview' }
    ] )
  },
  {
    id: 'medicine',
    label: 'Medicina Ocupacional',
    icon: 'Stethoscope',
    module: ModuleType.MEDICINE,
    subItems: sortSubItems([
      { id: 'aso', label: 'ASO', component: 'ASOManagement' },
      { id: 'clinic', label: 'Atendimento Médico', component: 'ClinicManagement' },
      { id: 'pcmso', label: 'PCMSO', component: 'PCMSOManagement' },
      { id: 'first-aid', label: 'Primeiros Socorros', component: 'FirstAid' }
    ])
  },
  {
    id: 'rh',
    label: 'Recursos Humanos',
    icon: 'Users',
    module: ModuleType.RH,
    subItems: sortSubItems([
      { id: 'absenteeism', label: 'Absenteísmo', component: 'AbsenteeismManagement' },
      { id: 'roles', label: 'Cargos', component: 'RoleManagement' },
      { id: 'collaborators', label: 'Colaboradores', component: 'CollaboratorList' },
      { id: 'functions', label: 'Funções', component: 'FunctionManagement' }
    ])
  },
  {
    id: 'safety',
    label: 'Segurança (EHS)',
    icon: 'ShieldCheck',
    module: ModuleType.SAFETY,
    subItems: sortSubItems([
      { id: 'brigade', label: 'Brigada de Incêndio', component: 'BrigadeManagement' },
      { id: 'cipa', label: 'CIPA', component: 'CIPAManagement' },
      { id: 'epi', label: 'Gestão de EPI', component: 'EPIManagement' },
      { id: 'insalubridade', label: 'Insalubridade', component: 'Insalubridade' },
      { id: 'inspections', label: 'Inspeções', component: 'Inspections' },
      { id: 'ltcat', label: 'LTCAT', component: 'LTCATManagement' },
      { id: 'periculosidade', label: 'Periculosidade', component: 'Periculosidade' },
      { id: 'pgr', label: 'PGR', component: 'PGRManagement' },
      { id: 'trainings', label: 'Treinamentos', component: 'Trainings' }
    ])
  }
].sort((a, b) => a.label.localeCompare(b.label));

export const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

export const EDUCATION_LEVELS = [
  'Analfabeto',
  'Fundamental Incompleto',
  'Fundamental Completo',
  'Médio Incompleto',
  'Médio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-Graduação',
  'Mestrado',
  'Doutorado'
];

export const MARITAL_STATUS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável'
];

export const GENDERS = [
  'Masculino',
  'Feminino',
  'Outro',
  'Prefiro não dizer'
];

export const RACES = [
  'Branca',
  'Preta',
  'Parda',
  'Amarela',
  'Indígena'
];

export const INITIAL_ROLES: Role[] = [
  { id: '1', registration: '1', name: 'Engenheiro de Segurança', functionId: '1', description: 'Responsável técnico pelo EHS' },
  { id: '2', registration: '2', name: 'Técnico de RH', functionId: '2', description: 'Gestão administrativa de pessoal' }
];

export const INITIAL_FUNCTIONS: JobFunction[] = [
  { id: '1', registration: '1', name: 'Supervisão de Campo', cbo: '2149-15', description: 'Liderança operacional' },
  { id: '2', registration: '2', name: 'Analista Pleno', cbo: '2524-05', description: 'Atividades analíticas complexas' }
];

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c1', name: 'EHS Solutions Matriz', cnpj: '12.345.678/0001-90', cnae: '70.20-4-00', address: 'Av. Paulista, 1000' }
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', companyId: 'c1', name: 'Filial São Paulo', cnpj: '12.345.678/0002-71', cnae: '70.20-4-00', address: 'Rua Augusta, 500' },
  { id: 'b2', companyId: 'c1', name: 'Filial Curitiba', cnpj: '12.345.678/0003-52', cnae: '70.20-4-00', address: 'Rua das Flores, 12' }
];

export const MASTER_USER: User = {
  id: 'master-01',
  name: 'Administrador Master',
  email: 'admin@ehspro.com',
  role: 'MASTER',
  functionName: 'Diretor de Tecnologia',
  permissions: [
    { moduleId: 'dashboard', subModules: ['overview'] },
    { moduleId: 'registrations', subModules: ['companies', 'branches'] },
    { moduleId: 'rh', subModules: ['collaborators', 'absenteeism', 'roles', 'functions'] },
    { moduleId: 'safety', subModules: ['pgr', 'ltcat', 'insalubridade', 'periculosidade', 'epi', 'cipa', 'brigade', 'inspections', 'trainings'] },
    { moduleId: 'medicine', subModules: ['aso', 'clinic', 'first-aid', 'pcmso'] },
    { moduleId: 'admin', subModules: ['users', 'settings'] }
  ]
};

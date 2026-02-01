
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { CollaboratorForm } from './components/Modules/RH/CollaboratorForm';
import { BulkImportModal } from './components/Modules/RH/BulkImportModal';
import { UserPermissions } from './components/Modules/Admin/UserPermissions';
import { Login } from './components/Auth/Login';
import { ResetPassword } from './components/Auth/ResetPassword';
import { DashboardOverview } from './components/Modules/Dashboard/DashboardOverview';
import { RegistrationModule } from './components/Modules/Registrations/RegistrationModule';
import { AbsenteeismModule } from './components/Modules/RH/AbsenteeismModule';
import { SimpleCRUDModule } from './components/Modules/RH/SimpleCRUDModule';
import { CipaModule } from './components/Modules/Safety/CipaModule';
import { UnitSelection } from './components/Auth/UnitSelection';
import {
  MASTER_USER,
  INITIAL_ROLES,
  INITIAL_FUNCTIONS,
  INITIAL_COMPANIES,
  INITIAL_BRANCHES,
  MENU_CONFIG,
  EDUCATION_LEVELS,
  MARITAL_STATUS,
  GENDERS,
  RACES
} from './constants';
import {
  User,
  Collaborator,
  Role,
  JobFunction,
  Company,
  Branch,
  MedicalCertificate
} from './types';
import {
  Plus,
  Search,
  LogOut,
  Edit3,
  Briefcase,
  Wrench,
  Eye,
  Building2,
  MapPin,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';

// Cadastros de Demonstração (Enriquecidos com Unidades Diferentes)
const DEMO_COLLABORATORS: Collaborator[] = [
  {
    id: 'demo-1',
    registration: '1',
    name: 'Carlos Alberto Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    motherName: 'Maria dos Santos',
    fatherName: 'José Alberto',
    birthDate: '1985-05-15',
    birthPlace: 'São Paulo',
    birthState: 'SP',
    nationality: 'Brasileira',
    education: EDUCATION_LEVELS[6],
    maritalStatus: MARITAL_STATUS[1],
    gender: GENDERS[0],
    race: RACES[0],
    address: 'Rua das Flores, 123, São Paulo - SP',
    phone: '(11) 98888-7777',
    email: 'carlos.alberto@empresa.com',
    roleId: '1',
    functionId: '1',
    companyId: 'c1',
    branchId: 'b1',
    admissionDate: '2020-01-10',
    status: 'ACTIVE',
    isDisabled: false,
    workRegime: 'EFFECTIVE',
    eSocialCode: 'S-2200-001'
  },
  {
    id: 'demo-2',
    registration: '2',
    name: 'Ana Paula Oliveira',
    cpf: '987.654.321-11',
    rg: '98.765.432-1',
    motherName: 'Lucia Oliveira',
    fatherName: 'Roberto Oliveira',
    birthDate: '1992-08-22',
    birthPlace: 'Curitiba',
    birthState: 'PR',
    nationality: 'Brasileira',
    education: EDUCATION_LEVELS[6],
    maritalStatus: MARITAL_STATUS[0],
    gender: GENDERS[1],
    race: RACES[2],
    address: 'Av. Sete de Setembro, 500, Curitiba - PR',
    phone: '(41) 97777-6666',
    email: 'ana.paula@empresa.com',
    roleId: '2',
    functionId: '2',
    companyId: 'c1',
    branchId: 'b2',
    admissionDate: '2021-03-15',
    status: 'ACTIVE',
    isDisabled: false,
    workRegime: 'EFFECTIVE',
    eSocialCode: 'S-2200-002'
  }
];

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Layout State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [activeSubItem, setActiveSubItem] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data State
  const [collaborators, setCollaborators] = useState<Collaborator[]>(DEMO_COLLABORATORS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [functions, setFunctions] = useState<JobFunction[]>(INITIAL_FUNCTIONS);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([MASTER_USER]);

  // Fetch initial data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, branchesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/branches')
        ]);

        if (companiesRes.ok && branchesRes.ok) {
          const companiesData = await companiesRes.json();
          const branchesData = await branchesRes.json();
          setCompanies(companiesData);
          setBranches(branchesData);
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      }
    };

    // Always fetch data if user is logged in, or purely on mount if public data is safe (here restricted to logged in logic usually, but fetched globally for now)
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // View Filtering Logic
  const activeBranch = useMemo(() => branches.find(b => b.id === activeBranchId), [activeBranchId, branches]);
  const activeCompany = useMemo(() => companies.find(c => c.id === activeBranch?.companyId), [activeBranch, companies]);

  const filteredCollaboratorsByUnit = useMemo(() =>
    collaborators.filter(c => c.branchId === activeBranchId),
    [collaborators, activeBranchId]);

  const filteredCertificatesByUnit = useMemo(() =>
    certificates.filter(cert => {
      const collab = collaborators.find(col => col.id === cert.collaboratorId);
      return collab?.branchId === activeBranchId;
    }),
    [certificates, collaborators, activeBranchId]);

  // UI Handlers
  const [isCollaboratorFormOpen, setIsCollaboratorFormOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [viewingCollaborator, setViewingCollaborator] = useState<Collaborator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (email: string) => {
    const found = allUsers.find(u => u.email === email) || MASTER_USER;
    setCurrentUser(found);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveBranchId(null);
  };

  const handleNavigate = (moduleId: string, subId: string) => {
    setActiveModule(moduleId);
    setActiveSubItem(subId);
    setIsCollaboratorFormOpen(false);
    setViewingCollaborator(null);
  };

  // CRUD Handlers
  const saveCollaborator = (data: Partial<Collaborator>) => {
    if (editingCollaborator) {
      setCollaborators(collaborators.map(c => c.id === editingCollaborator.id ? { ...c, ...data } as Collaborator : c));
    } else {
      const nextReg = (collaborators.length > 0
        ? Math.max(...collaborators.map(c => parseInt(c.registration) || 0)) + 1
        : 1).toString();

      const newCollaborator = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        registration: nextReg,
        branchId: activeBranchId
      } as Collaborator;
      setCollaborators([...collaborators, newCollaborator]);
    }
    setIsCollaboratorFormOpen(false);
    setEditingCollaborator(null);
  };

  const saveRole = (data: Partial<Role>) => {
    if (data.id) {
      setRoles(roles.map(r => r.id === data.id ? { ...r, ...data } as Role : r));
    } else {
      setRoles([...roles, { ...data, id: `r-${Date.now()}` } as Role]);
    }
  };

  const saveFunction = (data: Partial<JobFunction>) => {
    if (data.id) {
      setFunctions(functions.map(f => f.id === data.id ? { ...f, ...data } as JobFunction : f));
    } else {
      setFunctions([...functions, { ...data, id: `f-${Date.now()}` } as JobFunction]);
    }
  };

  const saveCompany = (data: Partial<Company>) => {
    if (data.id) {
      setCompanies(companies.map(c => c.id === data.id ? { ...c, ...data } as Company : c));
    } else {
      setCompanies([...companies, { ...data, id: `c-${Date.now()}` } as Company]);
    }
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setBranches(prev => prev.filter(b => b.companyId !== id));
    if (activeBranchId && branches.find(b => b.id === activeBranchId)?.companyId === id) {
      setActiveBranchId(null);
    }
  };

  const saveBranch = (data: Partial<Branch>) => {
    if (data.id) {
      setBranches(branches.map(b => b.id === data.id ? { ...b, ...data } as Branch : b));
    } else {
      setBranches([...branches, { ...data, id: `b-${Date.now()}` } as Branch]);
    }
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    if (activeBranchId === id) {
      setActiveBranchId(null);
    }
  };

  const saveCertificate = (data: Partial<MedicalCertificate>) => {
    if (data.id) {
      setCertificates(certificates.map(c => c.id === data.id ? { ...c, ...data } as MedicalCertificate : c));
    } else {
      setCertificates([...certificates, { ...data, id: `cert-${Date.now()}` } as MedicalCertificate]);
    }
  };

  const updatePermissions = (userId: string, moduleId: string, subId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newPerms = [...u.permissions];
      const existing = newPerms.find(p => p.moduleId === moduleId);
      if (existing) {
        existing.subModules = existing.subModules.includes(subId)
          ? existing.subModules.filter(s => s !== subId)
          : [...existing.subModules, subId];
      } else {
        newPerms.push({ moduleId, subModules: [subId] });
      }
      return { ...u, permissions: newPerms };
    }));
  };

  // Main Render Logic
  // Check for Reset Password Token
  const queryParams = new URLSearchParams(window.location.search);
  const resetToken = queryParams.get('token');

  if (resetToken) {
    return <ResetPassword token={resetToken} onSuccess={() => {
      // Clear query param and reload/rerender to show Login
      window.history.replaceState({}, document.title, "/");
      window.location.reload();
    }} />;
  }

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (!activeBranchId) return (
    <UnitSelection
      user={currentUser}
      companies={companies}
      branches={branches}
      onSelect={(branchId) => setActiveBranchId(branchId)}
      onLogout={handleLogout}
    />
  );

  const activeSubItemLabel = MENU_CONFIG.find(m => m.id === activeModule)?.subItems.find(s => s.id === activeSubItem)?.label || '';

  const searchedCollaborators = filteredCollaboratorsByUnit
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cpf.includes(searchQuery) ||
      c.registration.includes(searchQuery)
    );

  return (
    <div className="flex h-screen overflow-hidden bg-emerald-50/20">
      <Sidebar
        user={currentUser}
        activeModule={activeModule}
        activeSubItem={activeSubItem}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="bg-white border-b border-emerald-100 h-16 flex items-center justify-between px-8 flex-shrink-0 z-40 shadow-sm shadow-emerald-100/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <Building2 size={16} className="text-emerald-600" />
              <span className="text-xs font-black text-emerald-950 uppercase truncate max-w-[150px]">{activeCompany?.name}</span>
              <ChevronRight size={14} className="text-emerald-300" />
              <MapPin size={16} className="text-emerald-500" />
              <span className="text-xs font-black text-emerald-700 uppercase">{activeBranch?.name}</span>

              <button
                onClick={() => setActiveBranchId(null)}
                className="ml-2 p-1.5 hover:bg-emerald-200 rounded-lg text-emerald-400 hover:text-emerald-700 transition-all"
                title="Trocar Unidade"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            <div className="h-6 w-px bg-emerald-100" />
            <span className="text-emerald-900 font-black text-sm tracking-tight uppercase">{activeSubItemLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} /> <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {activeModule === 'dashboard' && <DashboardOverview collaborators={filteredCollaboratorsByUnit} certificates={filteredCertificatesByUnit} />}

            {activeModule === 'registrations' && (
              <RegistrationModule
                type={activeSubItem as any}
                companies={companies}
                branches={branches}
                onSaveCompany={saveCompany}
                onSaveBranch={saveBranch}
                onDeleteCompany={deleteCompany}
                onDeleteBranch={deleteBranch}
              />
            )}

            {activeModule === 'rh' && activeSubItem === 'collaborators' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-emerald-950">Colaboradores</h1>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{activeBranch?.name} • {searchedCollaborators.length} Registros</p>
                  </div>
                  <button onClick={() => setIsCollaboratorFormOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-emerald-500 transition-all">
                    <Plus size={20} /> Novo Registro
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={20} />
                  <input type="text" placeholder="Buscar na unidade..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-emerald-100 p-4 pl-12 rounded-2xl shadow-sm" />
                </div>
                <div className="bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-emerald-50/50 text-left text-xs text-emerald-400 font-black uppercase border-b border-emerald-100">
                        <th className="px-8 py-6">Matrícula</th>
                        <th className="px-8 py-6">Colaborador</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {searchedCollaborators.map(c => (
                        <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors group">
                          <td className="px-8 py-5 font-black text-xs text-emerald-600">{c.registration}</td>
                          <td className="px-8 py-5 font-black text-emerald-950">{c.name}</td>
                          <td className="px-8 py-5"><span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">{c.status}</span></td>
                          <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100">
                            <button onClick={() => setViewingCollaborator(c)} className="p-2 text-emerald-600" title="Visualizar"><Eye size={18} /></button>
                            <button onClick={() => { setEditingCollaborator(c); setIsCollaboratorFormOpen(true); }} className="p-2 text-emerald-400" title="Editar"><Edit3 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModule === 'rh' && activeSubItem === 'roles' && <SimpleCRUDModule items={roles} onSave={saveRole} onDelete={() => { }} title="Cargos" icon={Briefcase} availableFunctions={functions} />}
            {activeModule === 'rh' && activeSubItem === 'functions' && <SimpleCRUDModule items={functions} onSave={saveFunction} onDelete={() => { }} title="Funções" icon={Wrench} />}
            {activeModule === 'rh' && activeSubItem === 'absenteeism' && <AbsenteeismModule collaborators={filteredCollaboratorsByUnit} certificates={filteredCertificatesByUnit} onSaveCertificate={saveCertificate} />}

            {activeModule === 'safety' && activeSubItem === 'cipa' && activeBranch && activeCompany && (
              <CipaModule
                collaborators={filteredCollaboratorsByUnit}
                activeBranch={activeBranch}
                activeCompany={activeCompany}
              />
            )}

            {activeModule === 'admin' && activeSubItem === 'users' && <UserPermissions users={allUsers} onUpdatePermissions={updatePermissions} />}
          </div>
        </main>
      </div>

      {isCollaboratorFormOpen && (
        <CollaboratorForm
          onSave={saveCollaborator}
          onCancel={() => { setIsCollaboratorFormOpen(false); setEditingCollaborator(null); }}
          roles={roles}
          functions={functions}
          companies={companies}
          branches={branches}
          initialData={editingCollaborator}
          nextRegistration={(collaborators.length > 0
            ? Math.max(...collaborators.map(c => parseInt(c.registration) || 0)) + 1
            : 1).toString()}
        />
      )}
    </div>
  );
};

export default App;


import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { CollaboratorForm } from './components/Modules/RH/CollaboratorForm';
import { BulkImportModal } from './components/Modules/RH/BulkImportModal';
import { UsersModule } from './components/Modules/Admin/UsersModule';
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
  Trash2,
  Building2,
  MapPin,
  ChevronRight,
  ArrowLeftRight,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';
import { TrainingIntegration } from './components/Modules/Training/TrainingIntegration';
import { CollaboratorDetailsModal } from './components/Modules/RH/CollaboratorDetailsModal';

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
  // Data State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [functions, setFunctions] = useState<JobFunction[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([MASTER_USER]);

  // Fetch initial data
  const fetchData = React.useCallback(async () => {
    try {
      const [companiesRes, branchesRes, usersRes, rolesRes, functionsRes, collaboratorsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/branches'),
        fetch('/api/users'),
        fetch('/api/roles'),
        fetch('/api/functions'),
        fetch('/api/collaborators')
      ]);

      if (companiesRes.ok && branchesRes.ok) {
        setCompanies(await companiesRes.json());
        setBranches(await branchesRes.json());
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
        if (functionsRes.ok) setFunctions(await functionsRes.json());
        if (collaboratorsRes.ok) setCollaborators(await collaboratorsRes.json());
      }
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Auto-select branch ONLY if there is exactly one branch available
  React.useEffect(() => {
    if (branches.length === 1 && !activeBranchId) {
      setActiveBranchId(branches[0].id);
    }
  }, [branches, activeBranchId]);

  // ... (View Filtering remain same) ...
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

  // UI Handlers (remain same)
  const [isCollaboratorFormOpen, setIsCollaboratorFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
  const saveCollaborator = async (data: Partial<Collaborator>) => {
    try {
      let savedCollaborator;
      // Strip temporary ID if it exists and is generating a new one
      const payload = { ...data };
      if (!data.id || data.id.startsWith('demo-')) delete payload.id;

      // If we are editing, we expect a valid UUID ID
      // FIX: Ensure we use the ID from the data passed in if it matches editingCollaborator
      const targetId = editingCollaborator?.id || data.id;

      if (targetId && !targetId.startsWith('demo-')) {
        const res = await fetch(`/api/collaborators/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          savedCollaborator = await res.json();
          setCollaborators(prev => prev.map(c => c.id === savedCollaborator.id ? savedCollaborator : c));
        } else {
          console.error("Failed to update", await res.text());
        }
      } else {
        // Create
        // Auto-generate registration if missing (simple fallback)
        if (!payload.registration) {
          const maxReg = Math.max(...collaborators.map(c => parseInt(c.registration) || 0), 0);
          payload.registration = (maxReg + 1).toString();
        }

        const res = await fetch('/api/collaborators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          savedCollaborator = await res.json();
          setCollaborators(prev => [...prev, savedCollaborator]);
        }
      }
      setIsCollaboratorFormOpen(false);
      setEditingCollaborator(null);
    } catch (err) {
      console.error("Error saving collaborator:", err);
      alert("Erro ao salvar colaborador. Verifique o console.");
    }
  };



  const deleteCollaborator = async (id: string) => {
    try {
      if (id.startsWith('demo-')) {
        setCollaborators(prev => prev.filter(c => c.id !== id));
        setIsCollaboratorFormOpen(false);
        setEditingCollaborator(null);
        return;
      }
      const res = await fetch(`/api/collaborators/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCollaborators(prev => prev.filter(c => c.id !== id));
        setIsCollaboratorFormOpen(false);
        setEditingCollaborator(null);
      } else {
        alert("Erro ao excluir. Tente novamente.");
      }
    } catch (e) {
      console.error("Failed to delete collaborator", e);
    }
  };

  const handleCollaboratorImport = async (data: Collaborator[]) => {
    // Bulk create via API loop (since no bulk endpoint yet)
    // We filter out logic moved to backend, but here we just iterate
    const createdItems: Collaborator[] = [];

    for (const item of data) {
      try {
        const { id, ...cleanItem } = item; // Remove temporary ID from modal
        const res = await fetch('/api/collaborators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanItem)
        });
        if (res.ok) {
          createdItems.push(await res.json());
        }
      } catch (e) {
        console.error("Failed to import item", item, e);
      }
    }

    if (createdItems.length > 0) {
      setCollaborators(prev => [...prev, ...createdItems]);
    }
  };

  // ... (rest of CRUD handlers)
  const saveRole = async (data: Partial<Role>) => {
    try {
      let savedRole;
      if (data.id && !data.id.startsWith('r-')) { // Update existing
        const res = await fetch(`/api/roles/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          savedRole = await res.json();
          setRoles(prev => prev.map(r => r.id === savedRole.id ? savedRole : r));
        }
      } else { // Create
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          savedRole = await res.json();
          setRoles(prev => [...prev, savedRole]);
        }
      }
    } catch (e) { console.error("Error saving role", e); }
  };

  const saveFunction = async (data: Partial<JobFunction>) => {
    try {
      let savedFunction;
      if (data.id && !data.id.startsWith('f-')) { // Update existing
        const res = await fetch(`/api/functions/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          savedFunction = await res.json();
          setFunctions(prev => prev.map(f => f.id === savedFunction.id ? savedFunction : f));
        }
      } else { // Create
        const res = await fetch('/api/functions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          savedFunction = await res.json();
          setFunctions(prev => [...prev, savedFunction]);
        }
      }
    } catch (e) { console.error("Error saving function", e); }
  };

  // CRUD Handlers - Connected to API
  const saveCompany = async (data: Partial<Company>) => {
    try {
      let savedCompany;
      if (data.id && !data.id.startsWith('c-')) { // Update existing
        const res = await fetch(`/api/companies/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update company');
        savedCompany = await res.json();
        setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
      } else { // Create new
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create company');
        savedCompany = await res.json();
        setCompanies([...companies, savedCompany]);
      }
    } catch (err) {
      console.error("Error saving company:", err);
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete company');

      setCompanies(prev => prev.filter(c => c.id !== id));
      setBranches(prev => prev.filter(b => b.companyId !== id)); // Cascading delete visual update
      if (activeBranchId && branches.find(b => b.id === activeBranchId)?.companyId === id) {
        setActiveBranchId(null);
      }
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  const saveBranch = async (data: Partial<Branch>) => {
    try {
      let savedBranch;
      if (data.id && !data.id.startsWith('b-')) { // Update existing
        const res = await fetch(`/api/branches/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update branch');
        savedBranch = await res.json();
        setBranches(branches.map(b => b.id === savedBranch.id ? savedBranch : b));
      } else { // Create new
        const res = await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create branch');
        savedBranch = await res.json();
        setBranches([...branches, savedBranch]);
      }
    } catch (err) {
      console.error("Error saving branch:", err);
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete branch');

      setBranches(prev => prev.filter(b => b.id !== id));
      if (activeBranchId === id) {
        setActiveBranchId(null);
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
    }
  };

  const saveUser = async (data: any) => {
    try {
      let savedUser;
      if (data.id) { // Update
        const res = await fetch(`/api/users/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update user');
        savedUser = await res.json();
        setAllUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      } else { // Create
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create user');
        savedUser = await res.json();
        setAllUsers(prev => [savedUser, ...prev]);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setAllUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
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
  const queryParams = new URLSearchParams(window.location.search);
  const resetToken = queryParams.get('token');

  if (resetToken) {
    return <ResetPassword token={resetToken} onSuccess={() => {
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
      onDataUpdate={fetchData}
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

            {activeModule === 'registrations' && activeCompany && (
              <RegistrationModule
                type={activeSubItem as any}
                companies={companies.filter(c => c.id === activeCompany.id)}
                branches={branches.filter(b => b.companyId === activeCompany.id)}
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
                  <div className="flex gap-2">
                    <button onClick={() => setIsImportModalOpen(true)} className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black flex items-center gap-2 border border-emerald-100 uppercase hover:bg-emerald-100 transition-all text-xs tracking-widest">
                      <FileSpreadsheet size={18} /> Importar
                    </button>
                    <button onClick={() => setIsCollaboratorFormOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-emerald-500 transition-all uppercase text-xs tracking-widest">
                      <Plus size={18} /> Novo Registro
                    </button>
                  </div>
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
                        <th className="px-8 py-6">Função</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                      {searchedCollaborators.map(c => (
                        <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors group">
                          <td className="px-8 py-5 font-black text-xs text-emerald-600">{c.registration}</td>
                          <td className="px-8 py-5 font-black text-emerald-950">{c.name}</td>
                          <td className="px-8 py-5 text-sm text-emerald-800 font-medium">{functions.find(f => f.id === c.functionId)?.name || '-'}</td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {c.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100">
                            <button onClick={() => setViewingCollaborator(c)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Visualizar"><Eye size={18} /></button>
                            <button onClick={() => { setEditingCollaborator(c); setIsCollaboratorFormOpen(true); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit3 size={18} /></button>
                            <button
                              onClick={() => {
                                if (window.confirm("ATENÇÃO: A exclusão é irreversível. Deseja realmente excluir este colaborador?")) {
                                  deleteCollaborator(c.id);
                                }
                              }}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModule === 'rh' && activeSubItem === 'roles' && (
              <SimpleCRUDModule
                items={roles}
                onSave={saveRole}
                onDelete={() => { }}
                title="Cargos"
                icon={Briefcase}
                availableFunctions={functions}
                onCreateFunction={async (data) => saveFunction(data)}
              />
            )}
            {activeModule === 'rh' && activeSubItem === 'functions' && <SimpleCRUDModule items={functions} onSave={saveFunction} onDelete={() => { }} title="Funções" icon={Wrench} />}
            {activeModule === 'rh' && activeSubItem === 'absenteeism' && <AbsenteeismModule collaborators={filteredCollaboratorsByUnit} certificates={filteredCertificatesByUnit} onSaveCertificate={saveCertificate} />}

            {activeModule === 'safety' && activeSubItem === 'cipa' && activeBranch && activeCompany && (
              <CipaModule
                collaborators={filteredCollaboratorsByUnit}
                activeBranch={activeBranch}
                activeCompany={activeCompany}
              />
            )}

            {activeModule === 'admin' && activeSubItem === 'users' && (
              <UsersModule
                currentUser={currentUser}
                users={allUsers}
                companies={companies}
                branches={branches}
                onSaveUser={saveUser}
                onDeleteUser={deleteUser}
              />
            )}

            {activeModule === 'training' && activeSubItem === 'integration' && <TrainingIntegration />}
            {/* For now reusing a placeholder or standard view for Expirations until dedicated component is built */}
            {activeModule === 'training' && activeSubItem === 'expirations' && (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <GraduationCap size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900">Gestão de Vencimentos em Breve</h2>
                <p className="text-emerald-600">O módulo de gestão de vencimentos de treinamentos está sendo migrado.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {isCollaboratorFormOpen && (
        <CollaboratorForm
          onSave={saveCollaborator}
          onDelete={editingCollaborator ? () => deleteCollaborator(editingCollaborator.id) : undefined}
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

      {isImportModalOpen && (
        <BulkImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleCollaboratorImport}
          existingRegistrationCount={collaborators.length}
          currentData={filteredCollaboratorsByUnit} // Use only filtered data for the current unit
        />
      )}
      {viewingCollaborator && (
        <CollaboratorDetailsModal
          collaborator={viewingCollaborator}
          onClose={() => setViewingCollaborator(null)}
          roles={roles}
          functions={functions}
          companies={companies}
          branches={branches}
        />
      )}
    </div>
  );
};
export default App;

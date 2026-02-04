
import React, { useState, useEffect } from 'react';
import {
  Save,
  User as UserIcon,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Info,
  UserPlus,
  Heart,
  BookOpen,
  ShieldCheck,
  X,
  CreditCard,
  FileText,
  UserCheck,
  UserMinus,
  Trash2,
} from 'lucide-react';
import { Collaborator, Role, JobFunction, Company, Branch } from '../../../types';
import { generateProfessionalSummary } from '../../../services/geminiService';
import { EDUCATION_LEVELS, MARITAL_STATUS, GENDERS, RACES, BRAZILIAN_STATES } from '../../../constants';

interface CollaboratorFormProps {
  onSave: (data: Partial<Collaborator>) => void;
  onCancel: () => void;
  roles: Role[];
  functions: JobFunction[];
  companies: Company[];
  branches: Branch[];
  initialData?: Collaborator | null;
  nextRegistration: string;
  onDelete?: () => void;
}

export const CollaboratorForm: React.FC<CollaboratorFormProps> = ({
  onSave,
  onCancel,
  roles,
  functions,
  companies,
  branches,
  initialData,
  nextRegistration,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Collaborator>>(initialData || {
    registration: nextRegistration,
    name: '',
    cpf: '',
    rg: '',
    motherName: '',
    fatherName: '',
    birthDate: '',
    birthPlace: '',
    birthState: 'SP',
    nationality: 'Brasileira',
    education: EDUCATION_LEVELS[2],
    maritalStatus: MARITAL_STATUS[0],
    gender: GENDERS[0],
    race: RACES[0],
    address: '',
    phone: '',
    email: '',
    roleId: roles[0]?.id || '',
    functionId: functions[0]?.id || '',
    companyId: companies[0]?.id || '',
    branchId: branches[0]?.id || '',
    admissionDate: new Date().toISOString().split('T')[0],
    terminationDate: '',
    status: 'ACTIVE',
    isDisabled: false,
    disabilityType: '',
    workRegime: 'EFFECTIVE',
    thirdPartyCompanyName: '',
    eSocialCode: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'institutional'>('personal');

  useEffect(() => {
    if (formData.terminationDate && formData.terminationDate !== '') {
      setFormData(prev => ({ ...prev, status: 'INACTIVE' }));
    } else {
      setFormData(prev => ({ ...prev, status: 'ACTIVE' }));
    }
  }, [formData.terminationDate]);

  const handleAiBio = async () => {
    if (!formData.name || !formData.roleId) {
      alert("Preencha ao menos nome e cargo.");
      return;
    }
    setIsGenerating(true);
    const roleName = roles.find(r => r.id === formData.roleId)?.name;
    const summary = await generateProfessionalSummary({ ...formData, roleName });
    alert(`Sugestão de Resumo Profissional:\n\n${summary}`);
    setIsGenerating(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredBranches = branches.filter(b => b.companyId === formData.companyId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onCancel}></div>

      <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">

        <div className="bg-emerald-50/50 p-6 border-b border-emerald-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950">{initialData ? 'Editar Prontuário' : 'Novo Prontuário'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Matrícula: {formData.registration}</span>
                <div className="w-1 h-1 bg-emerald-200 rounded-full" />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${formData.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {formData.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex px-6 border-b border-emerald-50 bg-white shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'personal', label: 'Pessoal', icon: UserIcon },
            { id: 'professional', label: 'Carreira', icon: Briefcase },
            { id: 'institutional', label: 'Alocação', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-emerald-600 text-emerald-950 font-black'
                : 'border-transparent text-emerald-400 font-bold hover:text-emerald-600'
                }`}
            >
              <tab.icon size={16} />
              <span className="text-xs uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <form id="collabForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 bg-white custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-full">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">CPF</label>
                    <input required name="cpf" value={formData.cpf} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">RG</label>
                    <input name="rg" value={formData.rg} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Sexo</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Telefone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">E-mail</label>
                    <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1 col-span-full">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Endereço</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950 min-h-[80px]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Admissão</label>
                    <input required type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl font-bold text-emerald-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-800/60 uppercase tracking-widest ml-1">Desligamento</label>
                    <input type="date" name="terminationDate" value={formData.terminationDate} onChange={handleChange} className="w-full bg-red-50/30 border border-red-100 p-3 rounded-xl font-bold text-red-950" />
                  </div>
                  <div className="col-span-full bg-orange-50/30 p-6 rounded-3xl border border-orange-100 space-y-4">
                    <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest">Saúde e Inclusão</h4>
                    <div className="flex gap-4 items-start">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isDisabled" checked={formData.isDisabled} onChange={handleChange} className="w-5 h-5 rounded border-orange-300 text-orange-600" />
                        <span className="text-sm font-bold text-orange-950">PCD</span>
                      </label>
                      {formData.isDisabled && (
                        <input name="disabilityType" value={formData.disabilityType} onChange={handleChange} className="flex-1 bg-white border border-orange-100 p-2 rounded-lg font-bold text-orange-950 text-xs" placeholder="Tipo" />
                      )}
                      <div className="flex-1 space-y-1">
                        <select name="race" value={formData.race} onChange={handleChange} className="w-full bg-white border border-orange-100 p-2 rounded-lg font-bold text-orange-950 text-xs">
                          {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'institutional' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Empresa</label>
                      <select required name="companyId" value={formData.companyId} onChange={handleChange} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-950 text-sm">
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Filial</label>
                      <select required name="branchId" value={formData.branchId} onChange={handleChange} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-950 text-sm">
                        {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Cargo</label>
                      <select required name="roleId" value={formData.roleId} onChange={handleChange} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-950 text-sm">
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Função</label>
                      <select required name="functionId" value={formData.functionId} onChange={handleChange} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-950 text-sm">
                        {functions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Matrícula eSocial</label>
                      <input name="eSocialCode" value={formData.eSocialCode} onChange={handleChange} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-950 text-sm" placeholder="S-2200..." />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-emerald-50 bg-emerald-50/20 shrink-0 flex justify-between gap-3">
          {onDelete && initialData && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("ATENÇÃO: A exclusão é irreversível. Deseja realmente excluir este colaborador?")) {
                  onDelete();
                }
              }}
              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <Trash2 size={16} /> Excluir
            </button>
          )}
          <div className="flex justify-end gap-3 flex-1">
            <button type="button" onClick={onCancel} className="px-6 py-3 font-black text-xs text-emerald-600 uppercase tracking-widest hover:bg-emerald-100 rounded-xl transition-all">Cancelar</button>
            <button form="collabForm" type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-all">
              <Save size={18} /> {initialData ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

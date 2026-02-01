
import React, { useState } from 'react';
import { Building2, MapPin, ChevronRight, LogOut, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { User, Company, Branch } from '../../types';

interface UnitSelectionProps {
  user: User;
  companies: Company[];
  branches: Branch[];
  onSelect: (branchId: string) => void;
  onLogout: () => void;
}

export const UnitSelection: React.FC<UnitSelectionProps> = ({ user, companies, branches, onSelect, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Lógica de filtragem: MASTER vê tudo, USER vê allowedBranches
  const availableBranches = branches.filter(branch => {
    if (user.role === 'MASTER') return true;
    return user.allowedBranches?.includes(branch.id);
  }).filter(branch => 
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    companies.find(c => c.id === branch.companyId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">E</div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">EHS PRO</h1>
            </div>
            <h2 className="text-4xl font-black text-slate-950">Selecione a Unidade</h2>
            <p className="text-slate-500 font-medium mt-2">Bem-vindo, <span className="text-emerald-600 font-bold">{user.name}</span>. Escolha o contexto de trabalho.</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 font-bold rounded-2xl border border-red-100 hover:bg-red-50 transition-all shadow-sm"
          >
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquisar empresa ou filial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-slate-900"
                />
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Acesso {user.role}</span>
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {availableBranches.length > 0 ? availableBranches.map(branch => {
              const company = companies.find(c => c.id === branch.companyId);
              return (
                <button
                  key={branch.id}
                  onClick={() => onSelect(branch.id)}
                  className="group flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-200/20 transition-all text-left relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all shadow-sm shrink-0">
                    <Building2 size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{company?.name}</p>
                    <h4 className="text-xl font-black text-slate-950 truncate">{branch.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold truncate">{branch.address}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all shadow-sm shrink-0">
                    <ArrowRight size={20} />
                  </div>
                  
                  {/* Subtle hover pattern */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            }) : (
              <div className="col-span-full py-20 text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Search size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-400 uppercase">Nenhuma Unidade Encontrada</h3>
                 <p className="text-slate-500 font-medium">Você não possui permissões ou o termo de busca não retornou resultados.</p>
              </div>
            )}
          </div>
          
          <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <ShieldCheck size={14} className="text-emerald-500" />
                Sistema em Conformidade LGPD/NR-1
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

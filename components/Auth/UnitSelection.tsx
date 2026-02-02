
import React, { useState, useMemo } from 'react';
import { Building2, MapPin, ChevronRight, LogOut, ArrowRight, ShieldCheck, Search, ArrowLeft, LayoutGrid, Building } from 'lucide-react';
import { User, Company, Branch } from '../../types';

interface UnitSelectionProps {
  user: User;
  companies: Company[];
  branches: Branch[];
  onSelect: (branchId: string) => void;
  onLogout: () => void;
}

export const UnitSelection: React.FC<UnitSelectionProps> = ({ user, companies, branches, onSelect, onLogout }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filtrar Filiais Permitidas
  const allowedBranches = useMemo(() => {
    return branches.filter(branch => {
      if (user.role === 'MASTER') return true;
      return user.allowedBranches?.includes(branch.id);
    });
  }, [branches, user]);

  // 2. Identificar Empresas Disponíveis (baseado nas filiais permitidas)
  const availableCompanies = useMemo(() => {
    const companyIds = Array.from(new Set(allowedBranches.map(b => b.companyId)));
    return companies.filter(c => companyIds.includes(c.id));
  }, [companies, allowedBranches]);

  // 3. Filtragem de Busca
  const filteredCompanies = availableCompanies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cnpj.includes(searchQuery)
  );

  const filteredBranches = allowedBranches.filter(b =>
    b.companyId === selectedCompanyId &&
    (b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl w-full relative z-10 flex flex-col h-[85vh] animate-in fade-in zoom-in duration-700">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-auto flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/15 blur-xl rounded-full scale-150 pointer-events-none"></div>
              <img src="/assets/logo-full.png" alt="EHS PRO Logo" className="relative h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] z-10" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-white font-bold text-sm">{user.name}</span>
              <span className="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-3 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-xl transition-all border border-white/10 hover:border-red-500/30 backdrop-blur-md group"
              title="Sair"
            >
              <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">

          {/* Top Bar inside Card */}
          <div className="p-8 pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/20">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">
                {selectedCompanyId ? 'Selecione a Filial' : 'Selecione a Empresa'}
              </h2>
              <p className="text-emerald-200/60 text-sm font-medium">
                {selectedCompanyId
                  ? `Unidades disponíveis para ${companies.find(c => c.id === selectedCompanyId)?.name}`
                  : 'Escolha uma organização para continuar'
                }
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {selectedCompanyId && (
                <button
                  onClick={() => { setSelectedCompanyId(null); setSearchQuery(''); }}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-xl border border-white/10 transition-all font-bold text-sm"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={selectedCompanyId ? "Buscar filial..." : "Buscar empresa..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 focus:border-emerald-500/50 p-3 pl-11 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium text-white placeholder:text-white/20 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">

            {/* VIEW 1: COMPANIES (List Mode) */}
            {!selectedCompanyId && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => { setSelectedCompanyId(company.id); setSearchQuery(''); }}
                    className="w-full group flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-emerald-500/50 hover:from-emerald-900/40 hover:to-emerald-900/10 transition-all text-left overflow-hidden hover:shadow-lg hover:shadow-emerald-900/20"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 border border-white/5 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all duration-300 shadow-inner">
                        <Building size={24} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-emerald-300 transition-colors">{company.name}</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-white/40 text-xs font-mono">{company.cnpj}</p>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">
                            {allowedBranches.filter(b => b.companyId === company.id).length} Filiais
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </button>
                )) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                      <Search size={32} />
                    </div>
                    <p className="text-white/40">Nenhuma empresa encontrada.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: BRANCHES (List Mode) */}
            {selectedCompanyId && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                {filteredBranches.length > 0 ? filteredBranches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => onSelect(branch.id)}
                    className="w-full group flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-900/20 hover:border-emerald-500/50 transition-all text-left hover:shadow-lg hover:shadow-emerald-900/20"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner border border-emerald-500/20 shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{branch.name}</h4>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                          <p className="text-white/40 text-xs mt-0.5">{branch.address}</p>
                          <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20"></span>
                          <p className="text-white/30 text-xs font-mono">{branch.cnpj}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </button>
                )) : (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-white/40">Nenhuma filial disponível nesta empresa.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] font-medium text-white/30 uppercase tracking-widest px-8">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-600" />
              Ambiente Seguro
            </div>
            <div>
              v1.0.0
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


import React, { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Clock, 
  TrendingDown, 
  Stethoscope, 
  AlertOctagon, 
  Calendar,
  ChevronRight,
  HeartPulse,
  Siren
} from 'lucide-react';
import { Collaborator, MedicalCertificate } from '../../../types';

interface DashboardOverviewProps {
  collaborators: Collaborator[];
  certificates: MedicalCertificate[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ collaborators, certificates }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Cálculos de RH Geral
  const total = collaborators.length;
  const active = collaborators.filter(c => c.status === 'ACTIVE').length;
  const inactive = total - active;

  // Lógica de Absenteísmo para o Dashboard
  const absenteeismStats = useMemo(() => {
    const certsThisMonth = certificates.filter(cert => {
      const d = new Date(cert.startDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalDaysMonth = certsThisMonth.reduce((acc, curr) => acc + curr.days, 0);
    const avgDays = certsThisMonth.length > 0 ? (totalDaysMonth / certsThisMonth.length).toFixed(1) : "0";

    // Identificar colaboradores em risco INSS (15 dias/60 dias por letra de CID)
    const riskCollaborators = new Set<string>();
    
    certificates.forEach(cert => {
      if (!cert.cid || !cert.startDate) return;
      
      const cidFamily = cert.cid.charAt(0).toUpperCase();
      const startDate = new Date(cert.startDate);
      const sixtyDaysAgo = new Date(startDate);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const relatedCerts = certificates.filter(c => 
        c.collaboratorId === cert.collaboratorId &&
        c.cid?.toUpperCase().startsWith(cidFamily) &&
        new Date(c.startDate) >= sixtyDaysAgo &&
        new Date(c.startDate) <= startDate
      );

      const totalGroupDays = relatedCerts.reduce((acc, curr) => acc + curr.days, 0);
      if (totalGroupDays >= 15) {
        riskCollaborators.add(cert.collaboratorId);
      }
    });

    // Top Famílias de CID
    const cidRanking: Record<string, number> = {};
    certificates.forEach(c => {
      if (c.cid) {
        const letter = c.cid.charAt(0).toUpperCase();
        cidRanking[letter] = (cidRanking[letter] || 0) + c.days;
      }
    });

    const sortedCidRanking = Object.entries(cidRanking)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      certsThisMonth: certsThisMonth.length,
      totalDaysMonth,
      avgDays,
      riskCount: riskCollaborators.size,
      riskList: Array.from(riskCollaborators),
      sortedCidRanking
    };
  }, [certificates, currentMonth, currentYear]);

  const stats = [
    { label: 'Total Colaboradores', value: total, icon: Users, color: 'emerald' },
    { label: 'Colaboradores Ativos', value: active, icon: UserCheck, color: 'blue' },
    { label: 'Atestados (Mês)', value: absenteeismStats.certsThisMonth, icon: Stethoscope, color: 'indigo' },
    { label: 'Risco INSS Ativo', value: absenteeismStats.riskCount, icon: Siren, color: 'red' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 flex items-center gap-5 group hover:scale-[1.02] transition-transform">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border shadow-sm ${
              stat.color === 'red' ? 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white' : 
              stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white' :
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white' :
              'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              <stat.icon size={28} className={stat.color === 'red' ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-emerald-950 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Widgets de Absenteísmo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Painel de Impacto Mensal */}
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 lg:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="flex items-center justify-between mb-8 relative">
            <div>
              <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
                <Activity className="text-emerald-500" size={24} /> Saúde & Absenteísmo
              </h3>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Análise de Impacto Operacional</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600">{absenteeismStats.totalDaysMonth}</span>
              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-tighter">Dias Perdidos no Mês</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* Top Causas */}
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest flex items-center gap-2">
                 <HeartPulse size={14} /> Top Causas (Família CID)
               </h4>
               <div className="space-y-3">
                  {absenteeismStats.sortedCidRanking.length > 0 ? absenteeismStats.sortedCidRanking.map(([family, days]) => (
                    <div key={family} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs shadow-sm">
                        {family}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-black text-emerald-950 mb-1 uppercase">
                          <span>Grupo {family}</span>
                          <span>{days} Dias</span>
                        </div>
                        <div className="h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
                           <div 
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${Math.min((days / absenteeismStats.totalDaysMonth) * 100, 100)}%` }}
                           />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-6 text-center text-[10px] text-emerald-300 font-bold italic uppercase">Nenhum dado clínico acumulado.</div>
                  )}
               </div>
            </div>

            {/* Médias e Sinistralidade */}
            <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-center">
               <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-900/60 uppercase">Média p/ Atestado</span>
                  </div>
                  <span className="text-lg font-black text-emerald-900">{absenteeismStats.avgDays}d</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-900/60 uppercase">Novos Atestados</span>
                  </div>
                  <span className="text-lg font-black text-emerald-900">{absenteeismStats.certsThisMonth}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Alertas Críticos (O "Grito" do Dashboard) */}
        <div className="bg-white p-8 rounded-[3rem] border border-red-100 shadow-xl shadow-red-200/10 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-red-950 flex items-center gap-2">
              <AlertOctagon className="text-red-500 animate-pulse" size={24} /> Risco INSS
            </h3>
            <span className="bg-red-600 text-white text-[8px] px-2 py-1 rounded font-black">AÇÃO IMEDIATA</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
            {absenteeismStats.riskList.length > 0 ? absenteeismStats.riskList.map(id => {
              const collab = collaborators.find(c => c.id === id);
              return (
                <div key={id} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between group hover:bg-red-100 transition-all cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-200">
                        {collab?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-red-950 leading-tight truncate max-w-[120px]">{collab?.name}</p>
                        <p className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">Acúmulo de 15+ dias</p>
                      </div>
                   </div>
                   <ChevronRight size={16} className="text-red-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                 <ShieldAlert size={48} className="text-emerald-200 mb-2" />
                 <p className="text-[10px] font-black text-emerald-400 uppercase">Nenhum alerta de INSS</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-red-50">
             <p className="text-[9px] font-medium text-red-400 italic">
               *Baseado na regra de 15 dias em 60 dias para o mesmo grupo de CID.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividade Recente RH (Existente) */}
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-200/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <Activity className="text-emerald-500" size={24} /> Atividade de RH
            </h3>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">Recentes</span>
          </div>
          <div className="space-y-4">
            {collaborators.length === 0 ? (
              <p className="text-emerald-600/50 text-center py-10 font-medium italic text-xs">Aguardando novos registros...</p>
            ) : (
              collaborators.slice(-4).reverse().map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-600 border border-white">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-950">{c.name}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Admitido em {new Date(c.admissionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-[9px] font-black text-emerald-300 uppercase">Novo Titular</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Segurança (Existente) */}
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-200/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <ShieldAlert className="text-orange-500" size={24} /> Conformidade EHS
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-orange-100">
              <ShieldAlert className="text-orange-200" size={40} />
            </div>
            <p className="text-emerald-950 font-black uppercase text-sm tracking-tight">Status de Segurança: Seguro</p>
            <p className="text-emerald-600/70 text-[11px] font-medium mt-2 leading-relaxed max-w-[200px]">
              Nenhuma não-conformidade detectada nas inspeções dos últimos 30 dias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

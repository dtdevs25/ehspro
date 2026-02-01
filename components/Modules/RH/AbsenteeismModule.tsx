
import React, { useState, useMemo } from 'react';
import { 
  FilePlus, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  Stethoscope, 
  Activity, 
  X, 
  HeartPulse, 
  History, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertOctagon,
  BellRing,
  Info,
  Siren
} from 'lucide-react';
import { Collaborator, MedicalCertificate } from '../../../types';
import { getCidDescription } from '../../../services/geminiService';

interface AbsenteeismModuleProps {
  collaborators: Collaborator[];
  certificates: MedicalCertificate[];
  onSaveCertificate: (data: Partial<MedicalCertificate>) => void;
  onDeleteCertificate?: (id: string) => void;
}

export const AbsenteeismModule: React.FC<AbsenteeismModuleProps> = ({ 
  collaborators, 
  certificates, 
  onSaveCertificate,
  onDeleteCertificate 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [viewingCert, setViewingCert] = useState<MedicalCertificate | null>(null);
  const [certToDelete, setCertToDelete] = useState<MedicalCertificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<MedicalCertificate>>({
    collaboratorId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    days: 1,
    reason: '',
    cid: '',
    type: 'MEDICAL'
  });

  /**
   * getAccumulatedDays
   * Analisa o histórico para encontrar riscos de afastamento INSS.
   * Regra: 15 dias dentro de 60 dias para o MESMO GRUPO (Letra do CID).
   */
  const getAccumulatedDays = (cert: MedicalCertificate | Partial<MedicalCertificate>) => {
    if (!cert.collaboratorId || !cert.startDate) return { total: 0, isAtRisk: false };
    
    const cidFull = cert.cid || '';
    const cidFamily = cidFull.charAt(0).toUpperCase(); // Agrupamento por Capítulo (Ex: J)
    const startDate = new Date(cert.startDate);
    const sixtyDaysAgo = new Date(startDate);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Filtra atestados do mesmo colaborador no período de 60 dias
    const relatedCertsInPeriod = certificates.filter(c => {
      if (c.id === cert.id) return false; 
      if (c.collaboratorId !== cert.collaboratorId) return false;
      const cDate = new Date(c.startDate);
      return cDate >= sixtyDaysAgo && cDate <= startDate;
    });

    // Soma apenas os da mesma família CID (mesma letra inicial)
    const familyCerts = relatedCertsInPeriod.filter(c => 
      cidFamily && c.cid?.toUpperCase().startsWith(cidFamily)
    );

    const sumFamily = familyCerts.reduce((acc, curr) => acc + curr.days, 0);
    const totalFamily = sumFamily + (cert.days || 0);

    // Soma total geral (independente de CID) para alerta de sinistralidade
    const totalGeneral = relatedCertsInPeriod.reduce((acc, curr) => acc + curr.days, 0) + (cert.days || 0);
    
    return {
      total: totalFamily,
      totalGeneral,
      isAtRisk: totalFamily >= 15,
      isHighFrequency: totalGeneral >= 15 && totalFamily < 15,
      previousDays: sumFamily,
      cidFamily
    };
  };

  const correlationInfo = useMemo(() => getAccumulatedDays(formData), [formData, certificates, editingCertId]);

  const handleConsultCid = async () => {
    if (!formData.cid) return alert("Insira um código CID primeiro.");
    setIsAiLoading(true);
    const desc = await getCidDescription(formData.cid);
    if (desc) {
      setFormData(prev => ({ ...prev, reason: desc.replace(/"/g, '').trim() }));
    }
    setIsAiLoading(false);
  };

  const handleEdit = (cert: MedicalCertificate) => {
    setEditingCertId(cert.id);
    setFormData(cert);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCertificate({ ...formData, id: editingCertId || undefined });
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCertId(null);
    setFormData({
      collaboratorId: '', startDate: new Date().toISOString().split('T')[0],
      endDate: '', days: 1, reason: '', cid: '', type: 'MEDICAL'
    });
  };

  const filteredCertificates = certificates
    .filter(cert => {
      const coll = collaborators.find(c => c.id === cert.collaboratorId);
      return coll?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             cert.cid?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
             Saúde & Absenteísmo {certificates.some(c => getAccumulatedDays(c).isAtRisk) && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg animate-pulse">ALERTA ATIVO</span>}
          </h1>
          <p className="text-emerald-600/70 text-sm font-medium italic">Gestão preditiva: Monitorando acúmulo de 15 dias por família de CID.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg active:scale-95"
        >
          <FilePlus size={18} /> Novo Lançamento
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md" onClick={handleCloseForm}></div>
          <div className={`bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300 border-[6px] transition-all ${correlationInfo.isAtRisk ? 'border-red-600' : 'border-white/20'}`}>
            
            {correlationInfo.isAtRisk && (
              <div className="bg-red-600 text-white p-3 flex items-center justify-center gap-4 animate-pulse">
                <Siren size={24} className="shrink-0" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Risco Imediato de Afastamento Previdenciário</span>
                <Siren size={24} className="shrink-0" />
              </div>
            )}

            <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${correlationInfo.isAtRisk ? 'bg-red-600' : 'bg-emerald-600'}`}>
                  {correlationInfo.isAtRisk ? <BellRing size={20} className="animate-bounce" /> : <Stethoscope size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-emerald-950">{editingCertId ? 'Editar Registro' : 'Lançar Prontuário'}</h2>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocolo Digital EHS PRO</p>
                </div>
              </div>
              <button onClick={handleCloseForm} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Colaborador</label>
                    <select required value={formData.collaboratorId} onChange={e => setFormData({...formData, collaboratorId: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-xs outline-none">
                      <option value="">Selecione o titular...</option>
                      {collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Data Início</label>
                      <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Dias</label>
                      <input type="number" required min="1" value={formData.days} onChange={e => setFormData({...formData, days: parseInt(e.target.value)})} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-xs" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1 flex justify-between">
                      CID-10 Principal
                      <button type="button" onClick={handleConsultCid} disabled={isAiLoading || !formData.cid} className="text-[8px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black disabled:opacity-30">IA CONSULTAR</button>
                    </label>
                    <input placeholder="Ex: J11" value={formData.cid || ''} onChange={e => setFormData({...formData, cid: e.target.value.toUpperCase()})} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-black text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Detalhamento</label>
                    <textarea required placeholder="Breve observação..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-[10px] min-h-[80px] italic" />
                  </div>
                </div>
              </div>

              {/* PAINEL DE CORRELAÇÃO - AGORA MAIS SENSÍVEL */}
              {(correlationInfo.total > 0 || correlationInfo.totalGeneral > 0) && (
                <div className={`p-5 rounded-[2rem] border-2 shadow-xl animate-in slide-in-from-right-4 transition-all ${correlationInfo.isAtRisk ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-lg ${correlationInfo.isAtRisk ? 'bg-red-600 text-white border-red-400' : 'bg-blue-600 text-white border-blue-400'}`}>
                        {correlationInfo.isAtRisk ? <AlertTriangle size={24} className="animate-pulse" /> : <TrendingUp size={24} />}
                     </div>
                     <div className="flex-1">
                        <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-3 ${correlationInfo.isAtRisk ? 'text-red-700' : 'text-blue-700'}`}>
                          {correlationInfo.isAtRisk ? '🚨 ACÚMULO CRÍTICO DETECTADO' : 'Análise de Saúde do Trabalho'}
                        </h4>
                        
                        <div className="flex items-center gap-4 mb-4">
                           <div className="flex-1 bg-white/60 p-3 rounded-2xl border border-black/5 text-center">
                              <p className="text-[7px] font-black text-slate-400 uppercase">Capítulo CID ({correlationInfo.cidFamily})</p>
                              <p className={`text-xl font-black ${correlationInfo.isAtRisk ? 'text-red-600' : 'text-slate-700'}`}>{correlationInfo.total}d</p>
                           </div>
                           <div className="flex-1 bg-white/60 p-3 rounded-2xl border border-black/5 text-center">
                              <p className="text-[7px] font-black text-slate-400 uppercase">Total 60 Dias</p>
                              <p className="text-xl font-black text-slate-700">{correlationInfo.totalGeneral}d</p>
                           </div>
                        </div>

                        {correlationInfo.isAtRisk ? (
                           <div className="bg-red-600 text-white p-3 rounded-xl text-[10px] font-bold leading-tight flex items-center gap-3">
                              <Info size={24} />
                              Este colaborador deve ser encaminhado ao INSS. A soma de dias na mesma família CID atingiu <b>{correlationInfo.total} dias</b>.
                           </div>
                        ) : correlationInfo.isHighFrequency ? (
                           <p className="text-[9px] font-bold text-blue-800 leading-tight">
                             Atenção: O colaborador somou <b>{correlationInfo.totalGeneral} dias</b> em 60 dias (CIDs variados). Monitore a produtividade.
                           </p>
                        ) : (
                           <p className="text-[9px] font-bold text-blue-400 leading-tight">Histórico regular para este grupo CID no período.</p>
                        )}
                     </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-5 border-t border-emerald-50">
                <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 font-black text-[10px] text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-xl">Cancelar</button>
                <button type="submit" className={`px-10 py-2.5 rounded-xl font-black shadow-xl transition-all text-[10px] uppercase tracking-widest text-white ${correlationInfo.isAtRisk ? 'bg-red-600 hover:bg-red-700 animate-bounce' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                  {correlationInfo.isAtRisk ? 'Confirmar e Abrir CAT/INSS' : 'Salvar Prontuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Fluxo de Saúde - O "GRITO" VISUAL */}
      <div className="bg-white rounded-[2rem] border border-emerald-100 overflow-hidden shadow-xl shadow-emerald-200/20">
        <div className="p-5 border-b border-emerald-50 bg-emerald-50/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-black text-emerald-950 flex items-center gap-2"><History className="text-emerald-500" size={20} /> Histórico de Saúde</h3>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" size={16} />
                <input type="text" placeholder="Filtrar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-emerald-100 p-2 pl-9 rounded-xl text-xs font-medium outline-none" />
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50/10 text-left text-[9px] text-emerald-400 font-black uppercase tracking-widest border-b border-emerald-50">
              <tr>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Período / Status</th>
                <th className="px-6 py-4">CID & Análise de Risco</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50/50">
              {filteredCertificates.length > 0 ? filteredCertificates.map(cert => {
                const coll = collaborators.find(c => c.id === cert.collaboratorId);
                const info = getAccumulatedDays(cert);
                const isRisk = info.isAtRisk;

                return (
                  <tr key={cert.id} className={`hover:bg-white transition-all group relative ${isRisk ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      {isRisk && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600 shadow-[2px_0_10px_rgba(220,38,38,0.5)] z-10" />}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isRisk ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                           {coll?.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-black text-xs ${isRisk ? 'text-red-950' : 'text-emerald-950'}`}>{coll?.name}</div>
                          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">Mat: {coll?.registration}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-emerald-800">{new Date(cert.startDate).toLocaleDateString()}</span>
                          <span className={`w-fit mt-0.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${isRisk ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                             {cert.days} Dias
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-black uppercase ${isRisk ? 'text-red-600 underline decoration-2' : 'text-emerald-600'}`}>CID: {cert.cid || 'N/A'}</span>
                           {isRisk && (
                             <span className="bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-red-400 shadow-md">
                               <Siren size={8} /> ENCAMINHAR INSS ({info.total}D)
                             </span>
                           )}
                        </div>
                        <span className={`text-[10px] font-medium italic line-clamp-1 ${isRisk ? 'text-red-900/60' : 'text-emerald-900/60'}`}>"{cert.reason}"</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => setViewingCert(cert)} className={`p-1.5 rounded-lg transition-all ${isRisk ? 'text-red-600 hover:bg-red-100' : 'text-emerald-600 hover:bg-emerald-50'}`} title="Ver Prontuário"><Eye size={16} /></button>
                          <button onClick={() => handleEdit(cert)} className={`p-1.5 rounded-lg transition-all ${isRisk ? 'text-red-400 hover:bg-red-100' : 'text-emerald-400 hover:bg-emerald-50'}`} title="Editar"><Edit3 size={16} /></button>
                          <button onClick={() => setCertToDelete(cert)} className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="py-24 text-center text-[10px] text-emerald-300 font-black uppercase tracking-[0.2em] italic">Sem atestados registrados no fluxo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes - Compacto */}
      {viewingCert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-md" onClick={() => setViewingCert(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border-2 border-white/20">
             <div className={`p-5 text-white flex justify-between items-center ${getAccumulatedDays(viewingCert).isAtRisk ? 'bg-red-600' : 'bg-emerald-600'}`}>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <HeartPulse size={24} />
                   </div>
                   <div>
                      <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest mb-1 inline-block">Ficha de Saúde</span>
                      <h3 className="text-lg font-black tracking-tight truncate max-w-[200px]">{collaborators.find(c => c.id === viewingCert.collaboratorId)?.name}</h3>
                   </div>
                </div>
                <button onClick={() => setViewingCert(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X size={20} /></button>
             </div>

             <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-5 border-b border-emerald-50 pb-5">
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Início</p>
                      <p className="font-black text-emerald-950 text-sm flex items-center gap-1.5"><Calendar size={14} className="text-emerald-500" /> {new Date(viewingCert.startDate).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Duração</p>
                      <p className={`font-black text-sm flex items-center gap-1.5 ${getAccumulatedDays(viewingCert).isAtRisk ? 'text-red-600' : 'text-emerald-950'}`}>
                        <Clock size={14} className="text-emerald-500" /> {viewingCert.days} Dias
                      </p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">CID-10</p>
                      <p className={`font-black text-sm ${getAccumulatedDays(viewingCert).isAtRisk ? 'text-red-600' : 'text-emerald-600'}`}>{viewingCert.cid || 'N/A'}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">Soma 60 dias (Cap. {getAccumulatedDays(viewingCert).cidFamily})</p>
                      <p className={`font-black text-sm ${getAccumulatedDays(viewingCert).isAtRisk ? 'text-red-600' : 'text-emerald-950'}`}>
                        {getAccumulatedDays(viewingCert).total} Dias
                      </p>
                   </div>
                </div>

                <div className="space-y-2">
                   <h4 className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest flex items-center gap-2">Observação Clínica</h4>
                   <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 italic text-[11px] text-emerald-900 leading-relaxed shadow-inner">
                      "{viewingCert.reason}"
                   </div>
                </div>

                {getAccumulatedDays(viewingCert).isAtRisk && (
                   <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 animate-pulse">
                      <Siren size={20} className="shrink-0" />
                      <p className="text-[9px] font-black uppercase tracking-tighter">RECOMENDAÇÃO: AFASTAMENTO IMEDIATO PELO INSS. LIMITE DE 15 DIAS EXCEDIDO.</p>
                   </div>
                )}
             </div>

             <div className="p-5 border-t border-emerald-50 bg-emerald-50/20 flex justify-end gap-2">
                <button onClick={() => setViewingCert(null)} className="px-6 py-2.5 font-black text-[10px] text-emerald-600 uppercase tracking-widest">Fechar</button>
                <button onClick={() => { handleEdit(viewingCert); setViewingCert(null); }} className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-500 transition-all">Editar Prontuário</button>
             </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão - Compacto */}
      {certToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm" onClick={() => setCertToDelete(null)}></div>
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-red-50 p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
                  <Trash2 size={28} />
              </div>
              <h3 className="text-lg font-black text-red-950">Excluir Lançamento?</h3>
              <p className="text-red-900/60 font-medium text-[10px]">O histórico de acúmulo de dias será recalculado após esta ação.</p>
              <div className="flex gap-2 pt-2">
                  <button onClick={() => setCertToDelete(null)} className="flex-1 py-2.5 font-black text-[9px] text-red-600 uppercase">Manter</button>
                  <button onClick={() => { onDeleteCertificate?.(certToDelete.id); setCertToDelete(null); }} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-black text-[9px] uppercase shadow-lg">Confirmar</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

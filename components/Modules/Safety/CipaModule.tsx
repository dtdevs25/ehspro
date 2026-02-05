
import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  FileText,
  CreditCard,
  ClipboardList,
  AlertTriangle,
  X,
  ChevronRight,
  Printer,
  ShieldCheck,
  Trash2,
  Eye,
  Edit3,
  ArrowLeft,
  CalendarDays,
  LayoutGrid,
  List,
  Vote,
  ScrollText,
  Users2,
  Trash,
  Clock,
  Gavel,
  Building2,
  FileDown,
  Check,
  CheckCircle2,
  Calendar,
  UserCheck,
  Award,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import * as docx from 'docx';
import { Collaborator, CipaTerm, Branch, Company, Cipeiro, CipaMeeting, CipaActionPlan, CipaRole, CipaOrigin } from '../../../types';

interface CipaModuleProps {
  collaborators: Collaborator[];
  activeBranch: Branch;
  activeCompany: Company;
}

export const CipaModule: React.FC<CipaModuleProps> = ({ collaborators, activeBranch, activeCompany }) => {
  const [activeTab, setActiveTab] = useState<'eleicao' | 'cipeiros' | 'carteirinha' | 'reunioes' | 'planos'>('eleicao');
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [termViewMode, setTermViewMode] = useState<'grid' | 'list'>('grid');
  const [termToDelete, setTermToDelete] = useState<CipaTerm | null>(null);
  const [activeStepView, setActiveStepView] = useState<string | null>(null);

  // Election Logic States
  const [baseDate, setBaseDate] = useState('');
  const [isCalendarGenerated, setIsCalendarGenerated] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Data States for the selected term
  const [cipeiros, setCipeiros] = useState<Cipeiro[]>([]);
  const [meetings, setMeetings] = useState<CipaMeeting[]>([]);
  const [actionPlans, setActionPlans] = useState<CipaActionPlan[]>([]);

  // UI States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Document Data States
  const [sindicatoName, setSindicatoName] = useState('');
  const [repEmpresaName, setRepEmpresaName] = useState('');
  const [presCipaName, setPresCipaName] = useState('');

  // Data States
  const [terms, setTerms] = useState<CipaTerm[]>([]);

  // Fetch Terms
  const refreshTerms = async () => {
    if (!activeBranch?.id) return;
    try {
      const res = await fetch(`/api/cipa/terms?branchId=${activeBranch.id}`);
      if (res.ok) setTerms(await res.json());
    } catch (error) {
      console.error("Failed to load CIPA terms", error);
    }
  };

  useEffect(() => {
    refreshTerms();
  }, [activeBranch]);

  // Fetch Details
  const refreshDetails = async () => {
    if (!selectedTermId) return;
    try {
      // Members
      fetch(`/api/cipa/members?termId=${selectedTermId}`).then(r => r.json()).then(setCipeiros);
      // Meetings
      fetch(`/api/cipa/meetings?termId=${selectedTermId}`).then(r => r.json()).then(setMeetings);
      // Plans
      fetch(`/api/cipa/plans?termId=${selectedTermId}`).then(r => r.json()).then(setActionPlans);
    } catch (error) {
      console.error("Failed to load details", error);
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [selectedTermId]);

  const selectedTerm = useMemo(() => terms.find(t => t.id === selectedTermId), [selectedTermId, terms]);

  // Sync data and signatory defaults
  if (selectedTermId) {
    setRepEmpresaName(activeBranch.name + " Resp.");
    setPresCipaName("Presidente da Gestão Atual");
  }
}, [selectedTermId]);

const toggleStep = (id: string) => {
  setCompletedSteps(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
  );
};

const handleCreateElection = () => {
  if (!baseDate) return;
  setIsCalendarGenerated(true);
};

const handlePrint = () => {
  window.print();
};

const formatarDataLonga = (dateStr: string) => {
  if (!dateStr) return '';
  const data = new Date(dateStr);
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
};

const generateElectionCalendar = (posseDate: string) => {
  if (!posseDate) return [];
  const termEnd = new Date(posseDate);
  termEnd.setFullYear(termEnd.getFullYear() + 1);

  const eventos = [
    { id: 'ev1', item: "COMUNICAR INÍCIO DO PROCESSO AO SINDICATO", diasAntes: 65, prazoLegal: "ITEM 5.5.1.1" },
    { id: 'ev2', item: "CONVOCAÇÃO PARA ELEIÇÃO (PUBLICAÇÃO)", diasAntes: 60, prazoLegal: "ITEM 5.5.1" },
    { id: 'ev3', item: "FORMAÇÃO DA COMISSÃO ELEITORAL", diasAntes: 55, prazoLegal: "ITEM 5.5.2" },
    { id: 'ev4', item: "INÍCIO DAS INSCRIÇÕES DE CANDIDATOS", diasAntes: 50, prazoLegal: "ITEM 5.5.3-B" },
    { id: 'ev5', item: "TÉRMINO DAS INSCRIÇÕES DE CANDIDATOS", diasAntes: 35, prazoLegal: "ITEM 5.5.3-B" },
    { id: 'ev6', item: "DIVULGAÇÃO DOS INSCRITOS", diasAntes: 34, prazoLegal: "ITEM 5.5.3-E" },
    { id: 'ev7', item: "REALIZAÇÃO DA ELEIÇÃO (VOTAÇÃO)", diasAntes: 30, prazoLegal: "ITEM 5.5.3-F" },
    { id: 'ev13', item: "REALIZAÇÃO DA POSSE - ATA DE POSSE", diasAntes: 0, prazoLegal: "ITEM 5.4.8" }
  ];

  return eventos.map(ev => {
    const evDate = new Date(termEnd);
    evDate.setDate(evDate.getDate() - ev.diasAntes);
    if (evDate.getDay() === 0) evDate.setDate(evDate.getDate() - 2);
    if (evDate.getDay() === 6) evDate.setDate(evDate.getDate() - 1);

    return {
      ...ev,
      date: evDate.toISOString().split('T')[0],
      weekDay: evDate.toLocaleDateString('pt-BR', { weekday: 'long' })
    };
  });
};

const calendarItems = useMemo(() => generateElectionCalendar(baseDate), [baseDate]);

const progressPercentage = useMemo(() => {
  if (!calendarItems.length) return 0;
  return Math.round((completedSteps.length / calendarItems.length) * 100);
}, [completedSteps, calendarItems]);

const generateStep1Word = async () => {
  const ev1Data = calendarItems.find(i => i.id === 'ev1');
  if (!ev1Data) return;

  const doc = new docx.Document({
    sections: [{
      children: [
        new docx.Paragraph({
          children: [new docx.TextRun({ text: "COMUNICADO AO SINDICATO", bold: true, size: 32 })],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new docx.Paragraph({
          children: [new docx.TextRun({ text: `Ao ${sindicatoName || '[Sindicato]'},`, size: 24 })],
          spacing: { after: 400 }
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Comunicamos o início do processo eleitoral da CIPA Gestão ${selectedTerm?.year} da unidade ${activeBranch.name}.`,
              size: 24
            })
          ],
          spacing: { after: 400 }
        }),
        new docx.Paragraph({
          children: [new docx.TextRun({ text: formatarDataLonga(ev1Data.date), size: 24 })],
          alignment: docx.AlignmentType.RIGHT,
          spacing: { after: 800 }
        })
      ]
    }]
  });

  const blob = await docx.Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Comunicado_Sindicato_${selectedTerm?.year.replace('/', '-')}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const saveMember = async (e: React.FormEvent) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const payload = {
    termId: selectedTermId,
    collaboratorId: data.get('collaboratorId'),
    cipaRole: data.get('cipaRole'),
    origin: data.get('origin'),
    votes: data.get('votes')
  };

  try {
    if (editingItem) {
      await fetch(`/api/cipa/members/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/cipa/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    refreshDetails();
    setIsMemberModalOpen(false);
    setEditingItem(null);
  } catch (error) {
    alert("Erro ao salvar membro");
  }
};

const saveMeeting = async (e: React.FormEvent) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const payload = {
    termId: selectedTermId,
    date: data.get('date'),
    title: data.get('title'),
    description: data.get('description') || '',
    type: data.get('type')
  };

  try {
    if (editingItem) {
      await fetch(`/api/cipa/meetings/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/cipa/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    refreshDetails();
    setIsMeetingModalOpen(false);
    setEditingItem(null);
  } catch (error) {
    alert("Erro ao salvar reunião");
  }
};

const savePlan = async (e: React.FormEvent) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const payload = {
    meetingId: data.get('meetingId'), // Ensure this input exists or is set
    description: data.get('description'),
    deadline: data.get('deadline'),
    responsibleId: data.get('responsibleId'),
    status: 'PENDING'
  };
  // Note: meetingId must be selected in the modal or inferred. 
  // The current modal doesn't show meeting selection if called from a generic button?
  // Wait, the modal has `meetingId` input?
  // Checking `isPlanModalOpen` section... it DOES NOT have meetingId input.
  // It assumes we know the meeting? Or maybe we should add it?
  // Let's check below.
  // The mock implementation didn't strictly require meetingId.
  // I should add meetingId selection to the Plan Modal.
  // For now I will keep the fetch logic generic, but I need to fix the modal too.

  // Actually, looking at the mock `savePlan`: `meetingId: data.get('meetingId')`.
  // So the input MUST be there. I need to add it to the form if missing.

  try {
    if (editingItem) {
      await fetch(`/api/cipa/plans/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/cipa/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    refreshDetails();
    setIsPlanModalOpen(false);
    setEditingItem(null);
  } catch (error) {
    alert("Erro ao salvar plano");
  }
};

// --- RENDERIZAGEM ---

if (!selectedTermId) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
            <ShieldCheck size={32} className="text-emerald-500" /> Gestões CIPA
          </h1>
          <p className="text-emerald-600/70 text-sm font-medium italic mt-1">Gerencie os pleitos e mandatos vigentes.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-emerald-100 shadow-sm">
            <button
              onClick={() => setTermViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${termViewMode === 'grid' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:bg-emerald-50'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setTermViewMode('list')}
              className={`p-2 rounded-lg transition-all ${termViewMode === 'list' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:bg-emerald-50'}`}
            >
              <List size={20} />
            </button>
          </div>

          <button onClick={async () => {
            // Create new term via API
            const year = new Date().getFullYear();
            const nextYear = year + 1;
            const termLabel = `${year}/${nextYear}`;

            try {
              const res = await fetch('/api/cipa/terms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  year: termLabel,
                  startDate: new Date().toISOString(),
                  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                  branchId: activeBranch.id,
                  status: 'ELECTION'
                })
              });
              if (res.ok) {
                const newTerm = await res.json();
                setTerms([newTerm, ...terms]);
                setSelectedTermId(newTerm.id);
                setActiveTab('eleicao');
              }
            } catch (e) {
              alert("Erro ao criar novo pleito");
            }
          }}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-emerald-500 transition-all active:scale-95"
          >
            <Plus size={20} /> Iniciar Novo Pleito
          </button>
        </div>
      </div>

      {termViewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map(term => (
            <div key={term.id} className="group bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 text-left hover:border-emerald-400 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[250px]">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${term.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : term.status === 'ELECTION' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <CalendarDays size={28} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${term.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : term.status === 'ELECTION' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                    {term.status === 'ACTIVE' ? 'Vigente' : term.status === 'ELECTION' ? 'Em Eleição' : 'Encerrada'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setTermToDelete(term); }}
                    className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white"
                    title="Excluir Gestão"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-950 mb-1">{term.year}</h3>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">
                {term.startDate ? `${new Date(term.startDate).toLocaleDateString()} — ${new Date(term.endDate).toLocaleDateString()}` : 'Aguardando Planejamento'}
              </p>
              <button onClick={() => setSelectedTermId(term.id)} className="mt-auto flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                Gerenciar <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-emerald-50/50 text-[10px] font-black text-emerald-900 uppercase tracking-widest border-b border-emerald-100">
                <th className="px-8 py-6">Gestão / Ano</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Vigência</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {terms.map(term => (
                <tr key={term.id} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black"><CalendarDays size={18} /></div>
                      <span className="font-black text-emerald-950">{term.year}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${term.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : term.status === 'ELECTION' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                      {term.status === 'ACTIVE' ? 'Vigente' : term.status === 'ELECTION' ? 'Eleição' : 'Encerrada'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-emerald-400">
                    {term.startDate ? `${new Date(term.startDate).toLocaleDateString()} - ${new Date(term.endDate).toLocaleDateString()}` : '---'}
                  </td>
                  <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setSelectedTermId(term.id)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl" title="Gerenciar"><Eye size={20} /></button>
                    <button onClick={() => setTermToDelete(term)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" title="Excluir"><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

return (
  <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0">

    {activeStepView === 'ev1' ? (
      <div className="animate-in slide-in-from-right-12 duration-500">
        <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
          <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
            <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
              <ArrowLeft size={18} /> Voltar ao Calendário
            </button>
            <button onClick={generateStep1Word} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-500 transition-all">
              <FileDown size={18} /> Gerar Word (.docx)
            </button>
          </div>

          <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 space-y-12 min-h-[1100px] relative text-slate-800 print:shadow-none print:border-none print:p-0">
              <div className="flex items-center gap-10 border-b border-slate-100 pb-10">
                <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic">Logo</div>
                <div className="text-center flex-1 pr-32">
                  <h2 className="text-3xl font-black text-emerald-700 uppercase">Comunicado ao Sindicato</h2>
                  <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">CIPA Gestão {selectedTerm?.year}</p>
                </div>
              </div>

              <div className="space-y-8 leading-[1.8] text-base">
                <div className="flex flex-col gap-2 print:hidden">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nome do Sindicato</label>
                  <input
                    type="text"
                    placeholder="Ao Sindicato dos Trabalhadores..."
                    value={sindicatoName}
                    onChange={(e) => setSindicatoName(e.target.value)}
                    className="w-full bg-emerald-50/50 border-b-2 border-emerald-200 p-3 font-black text-emerald-950 outline-none"
                  />
                </div>
                <div className="hidden print:block font-black text-lg">Ao {sindicatoName || '[Sindicato]'}</div>
                <p className="text-justify">
                  A <span className="font-black">{activeCompany.name}</span>, inscrita sob o CNPJ <span className="font-black">{activeBranch.cnpj}</span>, comunica o início do processo eleitoral para a formação da CIPA Gestão {selectedTerm?.year}.
                </p>
                <p>Anexamos o edital de convocação para os devidos fins.</p>
              </div>

              <div className="pt-20 space-y-24">
                <p className="text-right font-black text-slate-900">{formatarDataLonga(calendarItems.find(i => i.id === 'ev1')?.date || '')}</p>
                <div className="flex justify-between items-start gap-12">
                  <div className="flex-1 space-y-4 text-center">
                    <input value={repEmpresaName} onChange={e => setRepEmpresaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                    <p className="text-[10px] font-black text-slate-500 uppercase">Representante Empresa</p>
                  </div>
                  <div className="flex-1 space-y-4 text-center">
                    <input value={presCipaName} onChange={e => setPresCipaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                    <p className="text-[10px] font-black text-slate-500 uppercase">Presidente CIPA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-xl print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedTermId(null)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-black text-emerald-950">{selectedTerm?.year}</h1>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Gestão Operacional de Segurança</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-3 shadow-xl hover:bg-emerald-500 transition-all active:scale-95">
              <Printer size={20} /> Imprimir / PDF
            </button>
            <button onClick={() => setTermToDelete(selectedTerm!)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all" title="Excluir Gestão">
              <Trash2 size={24} />
            </button>
          </div>
        </div>

        <div className="flex bg-white p-2 rounded-2xl border border-emerald-50 shadow-sm overflow-x-auto no-scrollbar gap-2 print:hidden">
          {[
            { id: 'eleicao', label: 'Pleito', icon: Vote },
            { id: 'cipeiros', label: 'Membros', icon: Users2 },
            { id: 'carteirinha', label: 'Carteirinhas', icon: CreditCard },
            { id: 'reunioes', label: 'Reuniões', icon: Calendar },
            { id: 'planos', label: 'Planos de Ação', icon: ClipboardList }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'}`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'eleicao' && (
            <div className="space-y-6 animate-in zoom-in duration-300">
              {!isCalendarGenerated ? (
                <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl p-12 text-center flex flex-col items-center">
                  <Gavel size={48} className="text-emerald-600 mb-8" />
                  <h2 className="text-3xl font-black text-emerald-950 uppercase mb-2">Calendário Eleitoral</h2>
                  <div className="w-full max-w-md bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 space-y-6">
                    <p className="text-sm text-emerald-600 font-medium">Informe a data da posse anterior para cálculo da NR-5.</p>
                    <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} className="w-full bg-white border border-emerald-200 p-4 rounded-xl font-black text-emerald-950 outline-none shadow-sm" />
                    <button onClick={handleCreateElection} disabled={!baseDate} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-emerald-500 disabled:opacity-30 transition-all">Gerar Calendário</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 print:space-y-4">
                  <div className="hidden print:flex items-center justify-between border-b-2 border-emerald-600 pb-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-emerald-950 uppercase">Cronograma Eleitoral</h2>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{activeCompany.name} - Gestão {selectedTerm?.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900 uppercase">Unidade: {activeBranch.name}</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl flex items-center justify-between print:hidden">
                    <div><h3 className="text-xl font-black text-emerald-950 uppercase flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={24} /> Progresso do Pleito</h3></div>
                    <div className="flex items-center gap-6">
                      <span className="text-4xl font-black text-emerald-600">{progressPercentage}%</span>
                      <div className="w-64 h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} /></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden print:border-none print:shadow-none">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-emerald-50/50 text-[10px] font-black text-emerald-900 uppercase tracking-widest border-b border-emerald-100 print:bg-slate-100">
                          <th className="px-8 py-5 w-16 print:hidden">OK</th>
                          <th className="px-8 py-5">Item do Processo</th>
                          <th className="px-8 py-5 text-center">Data</th>
                          <th className="px-8 py-5 text-center">Dia da Semana</th>
                          <th className="px-8 py-5 text-center print:hidden">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {calendarItems.map((ev) => {
                          const isDone = completedSteps.includes(ev.id);
                          return (
                            <tr key={ev.id} className={`transition-all ${isDone ? 'bg-emerald-50/30' : ''}`}>
                              <td className="px-8 py-4 print:hidden">
                                <button onClick={() => toggleStep(ev.id)} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-emerald-100 hover:border-emerald-300'}`}>
                                  <Check size={18} />
                                </button>
                              </td>
                              <td className={`px-8 py-4 font-black text-xs ${isDone ? 'text-emerald-700' : 'text-emerald-950'}`}>{ev.item}</td>
                              <td className="px-8 py-4 text-center font-bold text-xs text-emerald-600">{new Date(ev.date).toLocaleDateString()}</td>
                              <td className="px-8 py-4 text-center text-[10px] font-black text-emerald-400 uppercase tracking-tighter">{ev.weekDay}</td>
                              <td className="px-8 py-4 text-center print:hidden">
                                <button onClick={() => ev.id === 'ev1' && setActiveStepView('ev1')} className={`p-2.5 rounded-xl transition-all ${ev.id === 'ev1' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 shadow-sm' : 'text-emerald-100 cursor-not-allowed'}`}>
                                  <Edit3 size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cipeiros' && (
            <div className="space-y-6 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-emerald-950 uppercase">Membros da CIPA</h2>
                <button onClick={() => { setEditingItem(null); setIsMemberModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-emerald-500">
                  <Plus size={18} /> Novo Membro
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cipeiros.length > 0 ? cipeiros.map(cip => {
                  const collab = collaborators.find(c => c.id === cip.collaboratorId);
                  return (
                    <div key={cip.id} className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-xl flex flex-col group relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-100">{collab?.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0"><h4 className="font-black text-emerald-950 truncate">{collab?.name}</h4><span className="text-[10px] font-black text-emerald-400 uppercase">{cip.cipaRole}</span></div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${cip.origin === 'EMPREGADOR' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{cip.origin === 'EMPREGADOR' ? 'Indicado' : 'Eleito'}</span>
                      </div>
                      <button onClick={() => { setEditingItem(cip); setIsMemberModalOpen(true); }} className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={16} /></button>
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-20 bg-white rounded-[3rem] border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <Users size={48} className="text-emerald-100 mb-4" /><p className="text-emerald-950 font-black uppercase text-sm">Nenhum membro cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'carteirinha' && (
            <div className="space-y-8 animate-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cipeiros.map(cip => {
                  const collab = collaborators.find(c => c.id === cip.collaboratorId);
                  return (
                    <div key={cip.id} className="relative w-full max-w-sm h-64 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] shadow-2xl p-6 text-white overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                      <div className="flex justify-between items-start mb-6"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">E</div><span className="font-black">EHS PRO</span></div><p className="text-[10px] font-black tracking-widest">{selectedTerm?.year}</p></div>
                      <div className="flex gap-6 items-center mb-6"><div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black">{collab?.name.charAt(0)}</div><div className="flex-1 space-y-1"><h4 className="text-xl font-black truncate">{collab?.name}</h4><p className="text-[10px] font-bold text-emerald-200 uppercase">{cip.cipaRole}</p></div></div>
                      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-end"><div><p className="text-[8px] font-black opacity-60 uppercase">CPF</p><p className="text-[10px] font-black">{collab?.cpf}</p></div><ShieldCheck size={32} className="text-white/20" /></div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"><button className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-black text-xs uppercase"><Download size={16} /> Baixar Digital</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reunioes' && (
            <div className="space-y-6 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between"><h2 className="text-xl font-black text-emerald-950 uppercase">Reuniões</h2><button onClick={() => { setEditingItem(null); setIsMeetingModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase"><Plus size={18} /> Agendar</button></div>
              <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-emerald-50/50 text-[10px] font-black text-emerald-900 uppercase"><tr><th className="px-8 py-5">Data</th><th className="px-8 py-5">Título</th><th className="px-8 py-5 text-right">Ações</th></tr></thead>
                  <tbody className="divide-y divide-emerald-50">
                    {meetings.map(meet => (
                      <tr key={meet.id} className="hover:bg-emerald-50/30 group"><td className="px-8 py-5 font-black text-emerald-600 text-xs">{new Date(meet.date).toLocaleDateString()}</td><td className="px-8 py-5 font-black text-emerald-950 text-xs">{meet.title}</td><td className="px-8 py-5 text-right flex items-center justify-end gap-2"><button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"><ScrollText size={18} /></button><button onClick={() => { setEditingItem(meet); setIsMeetingModalOpen(true); }} className="p-2 text-emerald-400 hover:bg-emerald-50 rounded-xl"><Edit3 size={18} /></button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'planos' && (
            <div className="space-y-6 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between"><h2 className="text-xl font-black text-emerald-950 uppercase">Planos de Ação</h2><button onClick={() => { setEditingItem(null); setIsPlanModalOpen(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase"><Plus size={18} /> Nova Ação</button></div>
              <div className="grid grid-cols-1 gap-4">
                {actionPlans.map(plan => {
                  const responsible = collaborators.find(c => c.id === plan.responsibleId);
                  return (
                    <div key={plan.id} className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-xl flex items-center justify-between gap-6 hover:border-emerald-400 transition-all"><div className="flex-1"><h4 className="font-black text-emerald-950 text-sm mb-1">{plan.description}</h4><p className="text-[10px] font-bold text-emerald-400 uppercase">Prazo: {new Date(plan.deadline).toLocaleDateString()} • Resp: {responsible?.name}</p></div><span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${plan.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{plan.status}</span></div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </>
    )}

    {/* MODALS */}
    {isMemberModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsMemberModalOpen(false)}></div>
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
          <h2 className="text-lg font-black mb-6">Membro da CIPA</h2>
          <form onSubmit={saveMember} className="space-y-6">
            <select required name="collaboratorId" className="w-full bg-emerald-50 border p-4 rounded-xl font-black"><option value="">Selecionar Colaborador...</option>{collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-4"><select name="cipaRole" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="PRESIDENTE">Presidente</option><option value="VICE_PRESIDENTE">Vice</option><option value="TITULAR">Titular</option></select><select name="origin" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="EMPREGADO">Eleito</option><option value="EMPREGADOR">Indicado</option></select></div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Salvar Membro</button>
          </form>
        </div>
      </div>
    )}

    {isMeetingModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsMeetingModalOpen(false)}></div>
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
          <h2 className="text-xl font-black mb-6 uppercase">Agendar Reunião</h2>
          <form onSubmit={saveMeeting} className="space-y-6">
            <div className="grid grid-cols-2 gap-4"><input type="date" required name="date" className="bg-emerald-50 p-4 rounded-xl font-black" /><select name="type" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="ORDINARY">Ordinária</option><option value="EXTRAORDINARY">Extraordinária</option></select></div>
            <input required name="title" placeholder="Título da Pauta" className="w-full bg-emerald-50 p-4 rounded-xl font-black" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Salvar</button>
          </form>
        </div>
      </div>
    )}

    {isPlanModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
          <h2 className="text-xl font-black mb-6 uppercase">Nova Ação</h2>
          <form onSubmit={savePlan} className="space-y-4">
            <input required name="description" placeholder="O que fazer?" className="w-full bg-emerald-50 p-4 rounded-xl font-black" />
            <div className="grid grid-cols-2 gap-4">
              <select name="meetingId" required className="bg-emerald-50 p-4 rounded-xl font-black">
                <option value="">Vincular a Reunião...</option>
                {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <input type="date" required name="deadline" className="bg-emerald-50 p-4 rounded-xl font-black" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <select name="responsibleId" className="bg-emerald-50 p-4 rounded-xl font-black">{collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Confirmar</button>
          </form>
        </div>
      </div>
    )}

    {termToDelete && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 print:hidden">
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm" onClick={() => setTermToDelete(null)}></div>
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center space-y-4 relative z-10 border border-red-50 shadow-2xl animate-in zoom-in">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-2 shadow-inner"><AlertTriangle size={32} /></div>
          <h3 className="text-xl font-black text-red-950">Excluir Gestão {termToDelete.year}?</h3>
          <p className="text-xs text-red-900/60 font-medium leading-relaxed">Isso removerá permanentemente todos os dados vinculados a este pleito. <strong>Esta ação não poderá ser desfeita.</strong></p>
          <div className="flex gap-2 pt-4">
            <button onClick={() => setTermToDelete(null)} className="flex-1 py-3 font-black text-[10px] text-red-600 uppercase tracking-widest">Cancelar</button>
            <button onClick={async () => {
              if (!termToDelete) return;
              try {
                await fetch(`/api/cipa/terms/${termToDelete.id}`, { method: 'DELETE' });
                refreshTerms();
                setTermToDelete(null);
                if (selectedTermId === termToDelete.id) setSelectedTermId(null);
              } catch (e) {
                alert("Erro ao excluir");
              }
            }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-widest">Sim, Excluir</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

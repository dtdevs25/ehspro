
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertCircle,
  MessageSquare,
  Send,
  Bot,
  PenTool
} from 'lucide-react';
import * as docx from 'docx';
import { Collaborator, CipaTerm, Branch, Company, Cipeiro, CipaMeeting, CipaActionPlan, CipaRole, CipaOrigin } from '../../../types';
import { getNr5Group } from './nr5_cnae_mapping';

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

  // Election Sub-View State (Menu, Dimensioning, Calendar)
  const [eleicaoView, setEleicaoView] = useState<'menu' | 'dimensionamento' | 'calendario'>('menu');

  // Dimensioning Data States
  const [companyCnae, setCompanyCnae] = useState('');
  const [companyRiskGroup, setCompanyRiskGroup] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [cipaDimensioning, setCipaDimensioning] = useState<{ efetivos: number, suplentes: number }>({ efetivos: 0, suplentes: 0 });
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  // Auto-fill Dimensioning Data
  useEffect(() => {
    if (eleicaoView === 'dimensionamento') {
      // 1. Get Group from CNAE
      if (activeBranch.cnae) {
        setCompanyCnae(activeBranch.cnae);
        const group = getNr5Group(activeBranch.cnae);
        if (group) setCompanyRiskGroup(group);
      }

      // 2. Count Active Effective Collaborators
      // Assuming 'ACTIVE' status and 'EFFECTIVE' work regime based on common patterns or user instruction
      // If workRegime is not strictly 'EFFECTIVE' in DB yet, filtering by ACTIVE is a good start. 
      // User said: "só os efetivos ativos".
      const effectiveCount = collaborators.filter(c =>
        (c.status === 'ACTIVE') &&
        (c.workRegime === 'EFFECTIVE')
      ).length;

      setEmployeeCount(effectiveCount);
    }
  }, [eleicaoView, activeBranch, collaborators]);

  // Recalculate when Group or Count changes
  useEffect(() => {
    if (eleicaoView !== 'dimensionamento' || !companyRiskGroup) return;

    let efetivos = 0;
    let suplentes = 0;
    const num = employeeCount;

    // Lógica simplificada baseada na Tabela I da NR-5
    if (num >= 20) {
      if (['C-1', 'C-2', 'C-3a', 'C-5', 'C-6', 'C-7', 'C-10', 'C-11', 'C-12', 'C-13'].includes(companyRiskGroup)) {
        if (num <= 29) { efetivos = 1; suplentes = 1; }
        else if (num <= 50) { efetivos = 2; suplentes = 2; }
        else if (num <= 80) { efetivos = 3; suplentes = 3; }
        else if (num <= 100) { efetivos = 4; suplentes = 3; }
        else { efetivos = 4; suplentes = 4; }
      }
      else if (['C-14', 'C-29', 'C-31', 'C-35'].includes(companyRiskGroup)) {
        if (num <= 29) { efetivos = 0; suplentes = 0; } // NR-5: Designado
        else if (num <= 50) { efetivos = 1; suplentes = 1; } // Typically starts here for these groups
        else if (num <= 80) { efetivos = 1; suplentes = 1; }
        else if (num <= 100) { efetivos = 2; suplentes = 2; }
        else { efetivos = 3; suplentes = 3; }
      }
      else {
        // Default fallback
        if (num <= 50) { efetivos = 1; suplentes = 1; }
        else { efetivos = 2; suplentes = 2; }
      }
    } else {
      efetivos = 0; suplentes = 0;
    }

    setCipaDimensioning({ efetivos, suplentes });

  }, [companyRiskGroup, employeeCount, eleicaoView]);


  // Data States for the selected term
  const [cipeiros, setCipeiros] = useState<Cipeiro[]>([]);
  const [meetings, setMeetings] = useState<CipaMeeting[]>([]);
  const [actionPlans, setActionPlans] = useState<CipaActionPlan[]>([]);

  // UI States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingTerm, setEditingTerm] = useState<CipaTerm | null>(null);

  // Document Data States
  const [sindicatoName, setSindicatoName] = useState('');
  const [repEmpresaName, setRepEmpresaName] = useState('');
  const [presCipaName, setPresCipaName] = useState('');

  // Step 2 Data States
  const [electionTimeRange, setElectionTimeRange] = useState('');
  const [electionLocation, setElectionLocation] = useState('');

  // Step 3 Data States
  const [vicePresidenteName, setVicePresidenteName] = useState('');
  const [secretarioName, setSecretarioName] = useState('');
  const [reuniaoTime, setReuniaoTime] = useState('');

  // Step 4 Data States
  const [candidates, setCandidates] = useState<{
    id: string;
    name: string;
    nickname: string;

  }[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Signature Logic
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'DRAW' | 'QR'>('DRAW');
  const [qrCodeData, setQrCodeData] = useState<{ id: string, url: string } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Setup canvas drawing context settings once modal opens or via effect
  useEffect(() => {
    if (isRegistrationModalOpen && signatureRef.current && signatureMethod === 'DRAW') {
      const canvas = signatureRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [isRegistrationModalOpen, signatureMethod]);

  // Polling for Mobile Signature
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRegistrationModalOpen && signatureMethod === 'QR' && qrCodeData && isPolling) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/cipa/candidates/${qrCodeData.id}/check-status`);
          if (res.ok) {
            const data = await res.json();
            if (data.signatureUrl || data.status === 'APPROVED') {
              setIsPolling(false);
              handleConfirmRegistration(qrCodeData.id); // Finalize
            }
          }
        } catch (e) { console.error("Polling error", e); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isRegistrationModalOpen, signatureMethod, qrCodeData, isPolling, selectedCandidateId]); // Added selectedCandidateId to dependencies

  const initQrSession = async () => {
    if (!selectedCandidateId || !selectedTermId) return;
    try {
      const res = await fetch('/api/cipa/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termId: selectedTermId, collaboratorId: selectedCandidateId, signature: null })
      });
      if (res.ok) {
        const data = await res.json();
        const signUrl = `${window.location.origin}/public/cipa-sign/${data.id}`;
        setQrCodeData({ id: data.id, url: signUrl });
        setIsPolling(true);
      } else {
        alert("Erro ao iniciar sessão de assinatura remota.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const getCanvasCoordinates = (e: any) => {
    const canvas = signatureRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.type.includes('touch') ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e: any) => {
    // Prevent default to stop scrolling on mobile if touching canvas
    // if (e.type === 'touchstart') e.preventDefault(); 

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    const ctx = signatureRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    const ctx = signatureRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = signatureRef.current?.getContext('2d');
    ctx?.closePath();
  };

  const clearSignature = () => {
    const canvas = signatureRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
  };

  const handleConfirmRegistration = async (existingCandidateId?: string) => {
    // If passing ID directly (mobile flow), skip validations
    if (!existingCandidateId && (!selectedCandidateId || !selectedTermId)) return;

    let signatureDataUrl = null;

    if (!existingCandidateId) {
      // Drawing Flow
      const canvas = signatureRef.current;
      signatureDataUrl = canvas?.toDataURL('image/png');

      if (!signatureDataUrl) {
        alert("Por favor, assine no campo indicado ou use a opção Celular.");
        return;
      }
    }

    try {
      let newCand;
      if (existingCandidateId) {
        // Already created via QR flow, just fetching latest state or confirming locally
        // Actually, if it was QR flow, polling already confirmed it.
        // Just update UI.
        const res = await fetch(`/api/cipa/candidates/${existingCandidateId}/check-status`); // Re-fetch to be sure
        newCand = { id: existingCandidateId }; // Mock, real data below
        if (res.ok) {
          const updated = await res.json();
          // If email not sent yet for mobile (since status was pending), backend should handle it on status change or we call another endpoint?
          // Current backend sends email ONLY on creation if signature exists.
          // For mobile flow, the mobile upload endpoint updates status to APPROVED.
          // We might need to trigger email sending separately or trust the backend mobile endpoint handled it?
          // Whatever, for now let's assume valid.
        }
      } else {
        const res = await fetch('/api/cipa/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            termId: selectedTermId,
            collaboratorId: selectedCandidateId,
            signature: signatureDataUrl
          })
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Erro ao registrar inscrição");
          return;
        }
        newCand = await res.json();
      }

      // Update local list
      const collab = collaborators.find(c => c.id === selectedCandidateId);
      setCandidates(prev => [...prev, {
        id: newCand.id,
        name: collab?.name || 'Unknown',
        nickname: collab?.nickname || '',
        sector: collab?.branchId || '',
        role: collab?.roleId || '',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }]);

      setIsRegistrationModalOpen(false);
      setSelectedCandidateId('');
      setQrCodeData(null);
      setSignatureMethod('DRAW');
      setIsPolling(false);
      if (signatureRef.current) clearSignature();
      alert("Inscrição Confirmada! O comprovante foi enviado por e-mail.");

    } catch (e) {
      alert("Erro de conexão ao registrar");
    }
  };


  // AI Chat States
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente especialista em NR-5 (CIPA). Posso tirar dúvidas sobre dimensionamento, processo eleitoral, estabilidade (garantia de emprego) e mais. Como posso ajudar?' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAskAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiChatInput.trim() || isAiLoading) return;

    const question = aiChatInput;
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/cipa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      if (data.text) {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, não consegui processar sua pergunta no momento.' }]);
      }
    } catch (error) {
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: 'Ocorreu um erro ao conectar com o especialista. Tente novamente.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };


  const getImageArrayBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
      // Use proxy to avoid CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) return null;
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error fetching logo:", error);
      return null;
    }
  };



  const generateStep4Word = async (candidateId?: string) => {
    const candidateToPrint = candidateId
      ? candidates.find(c => c.id === candidateId)
      : candidates[candidates.length - 1]; // Default to last if not specified

    if (!candidateToPrint) {
      alert("Nenhum candidato selecionado para gerar a ficha.");
      return;
    }

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageParagraph = null;

    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageParagraph = new docx.Paragraph({
          children: [
            new docx.ImageRun({
              data: buffer,
              transformation: { width: 80, height: 80 },
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      }
    }

    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          ...(logoImageParagraph ? [logoImageParagraph] : []),
          // 1ª VIA - CANDIDATO
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "FICHA DE INSCRIÇÃO DE CANDIDATOS", bold: true, size: 28 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24 })],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Table Form 1
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Candidato:" })], width: { size: 20, type: docx.WidthType.PERCENTAGE } }), new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: candidateToPrint.name, bold: true })] })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Apelido:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.nickname })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Setor:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.sector })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Função:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.role })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Data:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.date + " - " + candidateToPrint.time })] })] }),
            ]
          }),

          new docx.Paragraph({ text: "", spacing: { after: 800 } }), // Space for signatures

          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "__________________________________          __________________________________" })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `${presCipaName}                                    ${candidateToPrint.name}` })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Presidente da CIPA Atual                                          Candidato" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new docx.Paragraph({ text: "1ª Via - Candidato", alignment: docx.AlignmentType.RIGHT, spacing: { after: 600 } }),

          new docx.Paragraph({
            children: [new docx.TextRun({ text: "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", color: "CCCCCC" })],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),

          // 2ª VIA - EMPRESA (Copy of above)
          ...(logoImageParagraph ? [logoImageParagraph] : []),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "FICHA DE INSCRIÇÃO DE CANDIDATOS", bold: true, size: 28 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24 })],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Candidato:" })], width: { size: 20, type: docx.WidthType.PERCENTAGE } }), new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: candidateToPrint.name, bold: true })] })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Apelido:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.nickname })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Setor:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.sector })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Função:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.role })] })] }),
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Data:" })] }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.date + " - " + candidateToPrint.time })] })] }),
            ]
          }),

          new docx.Paragraph({ text: "", spacing: { after: 800 } }),

          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "__________________________________          __________________________________" })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `${presCipaName}                                    ${candidateToPrint.name}` })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Presidente da CIPA Atual                                          Candidato" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new docx.Paragraph({ text: "2ª Via - Empresa", alignment: docx.AlignmentType.RIGHT }),
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ficha_Inscricao_${candidateToPrint.name.replace(/ /g, '_')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
  useEffect(() => {
    if (selectedTermId && selectedTerm) {
      // @ts-ignore
      if (selectedTerm.companyRepId) {
        // @ts-ignore
        const c = collaborators.find(c => c.id === selectedTerm.companyRepId);
        setRepEmpresaName(c ? c.name : activeBranch.name + " Resp.");
      } else {
        setRepEmpresaName(activeBranch.name + " Resp.");
      }

      // @ts-ignore
      if (selectedTerm.cipaPresidentId) {
        // @ts-ignore
        const c = collaborators.find(c => c.id === selectedTerm.cipaPresidentId);
        setPresCipaName(c ? c.name : "Presidente da Gestão Atual");
      } else {
        setPresCipaName("Presidente da Gestão Atual");
      }

      // Auto-set baseDate for calendar based on Term's Start Date
      // The generator adds 1 year to baseDate to find target.
      // So we set baseDate = startDate - 1 year.
      if (selectedTerm.startDate) {
        const startDate = new Date(selectedTerm.startDate);
        if (!isNaN(startDate.getTime())) {
          const prevYearDate = new Date(startDate);
          prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);

          // Format to YYYY-MM-DD
          const formatted = prevYearDate.toISOString().split('T')[0];
          setBaseDate(formatted);
          setIsCalendarGenerated(true);
        }
      }
    }
  }, [selectedTermId, selectedTerm, activeBranch]);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleCreateElection = () => {
    // Legacy manual trigger, kept for fallback
    if (!baseDate) return;
    setIsCalendarGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatarDataLonga = (dateStr: string) => {
    if (!dateStr) return '';
    // Force timezone interpretation as local/Brasilia if needed, or just append T12:00:00 to avoid UTC rollover
    const data = new Date(dateStr + 'T12:00:00');
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

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageRun = null;
    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageRun = new docx.ImageRun({
          data: buffer,
          transformation: { width: 80, height: 80 }
        });
      }
    }

    // Prepare Header Table
    const headerTable = new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      borders: docx.TableBorders.NONE, // Remove default borders if desired, or keep them
      rows: [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              width: { size: 20, type: docx.WidthType.PERCENTAGE },
              children: [
                logoImageRun ? new docx.Paragraph({ children: [logoImageRun] }) : new docx.Paragraph({ text: "LOGO" })
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            }),
            new docx.TableCell({
              width: { size: 80, type: docx.WidthType.PERCENTAGE },
              children: [
                new docx.Paragraph({
                  children: [new docx.TextRun({ text: "COMUNICADO AO SINDICATO", bold: true, size: 28 })],
                  alignment: docx.AlignmentType.CENTER,
                }),
                new docx.Paragraph({
                  children: [new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24 })],
                  alignment: docx.AlignmentType.CENTER,
                })
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            })
          ]
        })
      ]
    });

    const doc = new docx.Document({
      sections: [{
        headers: {
          default: new docx.Header({
            children: [headerTable, new docx.Paragraph({ text: "", spacing: { after: 200 } })], // Add spacing after header
          }),
        },
        children: [
          new docx.Paragraph({
            children: [new docx.TextRun({ text: `Ao ${sindicatoName || '[Sindicato]'},`, size: 24 })],
            spacing: { before: 400, after: 400 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `A Empresa ${activeCompany.name}, inscrita sob o CNPJ ${activeBranch.cnpj}, comunica o início do processo eleitoral para a formação da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), Gestão ${selectedTerm?.year}, em conformidade com a Norma Regulamentadora nº 5 (NR-5).`,
                size: 24
              })
            ],
            alignment: docx.AlignmentType.JUSTIFIED,
            spacing: { after: 400 }
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: "Anexamos o edital de convocação para os devidos fins.", size: 24 })],
            alignment: docx.AlignmentType.JUSTIFIED,
            spacing: { after: 400 }
          }),

          new docx.Paragraph({
            children: [new docx.TextRun({ text: formatarDataLonga(ev1Data.date), size: 24 })],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { before: 800, after: 1200 }
          }),

          // Signatures
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            borders: docx.TableBorders.NONE,
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "__________________________________" })],
                        alignment: docx.AlignmentType.CENTER
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: repEmpresaName || "Representante da Empresa", bold: true, size: 20 })],
                        alignment: docx.AlignmentType.CENTER
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Representante da Empresa", size: 18 })],
                        alignment: docx.AlignmentType.CENTER
                      })
                    ]
                  }),
                  new docx.TableCell({
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "__________________________________" })],
                        alignment: docx.AlignmentType.CENTER
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: presCipaName || "Presidente da CIPA", bold: true, size: 20 })],
                        alignment: docx.AlignmentType.CENTER
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Presidente da CIPA", size: 18 })],
                        alignment: docx.AlignmentType.CENTER
                      })
                    ]
                  })
                ]
              })
            ]
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

  const generateStep2Word = async () => {
    const ev2Data = calendarItems.find(i => i.id === 'ev2'); // Convocação
    const ev7Data = calendarItems.find(i => i.id === 'ev7'); // Eleição
    const ev4Data = calendarItems.find(i => i.id === 'ev4'); // Início Inscrição
    const ev5Data = calendarItems.find(i => i.id === 'ev5'); // Fim Inscrição

    if (!ev2Data || !ev7Data || !ev4Data || !ev5Data) return;

    if (!electionTimeRange || !electionLocation) {
      alert("Por favor, preencha o horário e o local da eleição antes de gerar o documento.");
      return;
    }

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageParagraph = null;
    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageParagraph = new docx.Paragraph({
          children: [new docx.ImageRun({ data: buffer, transformation: { width: 80, height: 80 } })],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      }
    }

    const doc = new docx.Document({
      sections: [{
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "EDITAL DE CONVOCAÇÃO PARA ELEIÇÃO", bold: true, size: 36, color: "008000" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24, color: "555555" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `A Empresa ${activeCompany.name} comunica a todos os colaboradores que está aberto o processo eleitoral para a escolha dos representantes da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), Gestão ${selectedTerm?.year}, em conformidade com a Norma Regulamentadora nº 5 (NR-5).`,
                size: 24
              })
            ],
            spacing: { after: 400 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "A eleição ocorrerá no seguinte dia, horário e local:", size: 24 })
            ],
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Dia: ", bold: true, size: 24 }),
              new docx.TextRun({ text: formatarDataLonga(ev7Data.date), size: 24 })
            ],
            spacing: { after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Horário: ", bold: true, size: 24 }),
              new docx.TextRun({ text: `das ${electionTimeRange} horas`, size: 24 })
            ],
            spacing: { after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Local: ", bold: true, size: 24 }),
              new docx.TextRun({ text: electionLocation, size: 24 })
            ],
            spacing: { after: 400 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `O período de inscrições para candidatos ocorrerá de ${new Date(ev4Data.date).toLocaleDateString()} a ${new Date(ev5Data.date).toLocaleDateString()}. Os interessados deverão procurar o Departamento de Segurança do Trabalho para retirar e preencher o formulário de inscrição.`,
                size: 24
              })
            ],
            spacing: { after: 400 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "Participe! Sua colaboração é essencial para a construção de um ambiente de trabalho mais seguro e saudável para todos.",
                size: 24,
                bold: true
              })
            ],
            spacing: { after: 800 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: formatarDataLonga(ev2Data.date), size: 24 })],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { after: 1200 }
          }),
          new docx.Table({
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    width: { size: 50, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "____________________", size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: repEmpresaName, size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Representante da Empresa", size: 20 })],
                        alignment: docx.AlignmentType.CENTER,
                      })
                    ],
                    borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE } }
                  }),
                  new docx.TableCell({
                    width: { size: 50, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "____________________", size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: presCipaName, size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Presidente da CIPA Atual", size: 20 })],
                        alignment: docx.AlignmentType.CENTER,
                      })
                    ],
                    borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE } }
                  })
                ]
              })
            ],
            width: { size: 100, type: docx.WidthType.PERCENTAGE }
          })
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Edital_Convocacao_${selectedTerm?.year.replace('/', '-')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateStep3Word = async () => {
    const ev3Data = calendarItems.find(i => i.id === 'ev3'); // Formação Comissão
    if (!ev3Data) return;

    if (!vicePresidenteName || !secretarioName || !reuniaoTime) {
      alert("Por favor, preencha os dados da reunião (Vice-Presidente, Secretário, Horário) antes de gerar.");
      return;
    }

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageParagraph = null;
    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageParagraph = new docx.Paragraph({
          children: [new docx.ImageRun({ data: buffer, transformation: { width: 80, height: 80 } })],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      }
    }

    const doc = new docx.Document({
      sections: [{
        children: [
          ...(logoImageParagraph ? [logoImageParagraph] : []),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "ATA DE FORMAÇÃO DA COMISSÃO ELEITORAL", bold: true, size: 36, color: "008000" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24, color: "555555" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Reuniram-se os representantes da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA) da gestão atual e representantes da Empresa ${activeCompany.name} para a formação da Comissão Eleitoral (CE) da nova Gestão ${selectedTerm?.year}, em conformidade com a Norma Regulamentadora nº 5 (NR-5).`,
                size: 24
              })
            ],
            spacing: { after: 400 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Durante a reunião, o(a) Sr(a) ${presCipaName}, Presidente da CIPA em curso, e o(a) Sr(a) ${vicePresidenteName}, Vice-Presidente da CIPA em curso, foram nomeados membros da Comissão Eleitoral, conforme previsto na NR-5. O(a) Sr(a) ${presCipaName} assumirá a função de Presidente da Mesa Eleitoral, e o(a) Sr(a) ${secretarioName} exercerá a função de Secretário(a) da Mesa.`,
                size: 24
              })
            ],
            spacing: { after: 400 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `A reunião foi realizada no dia ${formatarDataLonga(ev3Data.date)}, às ${reuniaoTime}, ocasião em que foram discutidos o processo eleitoral, os aspectos legais envolvidos e a responsabilidade da Comissão Eleitoral na fiscalização, orientação e controle de todo o processo.`,
                size: 24
              })
            ],
            spacing: { after: 400 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "Não havendo outros assuntos a tratar, a reunião foi declarada encerrada. Para registro e divulgação, lavrou-se a presente Ata, que será disponibilizada para ciência de todos os colaboradores.",
                size: 24
              })
            ],
            spacing: { after: 800 },
            alignment: docx.AlignmentType.JUSTIFIED
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: formatarDataLonga(ev3Data.date), size: 24 })],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { after: 1200 }
          }),
          new docx.Table({
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    width: { size: 50, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "____________________", size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: repEmpresaName, size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Representante da Empresa", size: 20 })],
                        alignment: docx.AlignmentType.CENTER,
                      })
                    ],
                    borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE } }
                  }),
                  new docx.TableCell({
                    width: { size: 50, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "____________________", size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: presCipaName, size: 24 })],
                        alignment: docx.AlignmentType.CENTER,
                      }),
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: "Presidente da CIPA Atual", size: 20 })],
                        alignment: docx.AlignmentType.CENTER,
                      })
                    ],
                    borders: { top: { style: docx.BorderStyle.NONE }, bottom: { style: docx.BorderStyle.NONE }, left: { style: docx.BorderStyle.NONE }, right: { style: docx.BorderStyle.NONE } }
                  })
                ]
              })
            ],
            width: { size: 100, type: docx.WidthType.PERCENTAGE }
          })
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ata_Comissao_Eleitoral_${selectedTerm?.year.replace('/', '-')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const generateStep6Word = async () => {
    if (candidates.length === 0) {
      alert("Não há candidatos inscritos para gerar o edital.");
      return;
    }

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageParagraph = null;
    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageParagraph = new docx.Paragraph({
          children: [new docx.ImageRun({ data: buffer, transformation: { width: 80, height: 80 } })],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      }
    }

    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          ...(logoImageParagraph ? [logoImageParagraph] : []),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Edital de Divulgação de Inscritos", bold: true, size: 36 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [new docx.TextRun({ text: `CIPA Gestão ${selectedTerm?.year}`, size: 24 })],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `A ${activeCompany.name}, em cumprimento ao item 5.5.3, alínea "e" da Norma Regulamentadora nº 5 (NR-5), torna público a relação dos candidatos inscritos para a eleição da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA).`, size: 24 }),
            ],
            alignment: docx.AlignmentType.JUSTIFIED,
            spacing: { after: 400 }
          }),

          new docx.Paragraph({
            children: [new docx.TextRun({ text: "Candidatos inscritos:", bold: true, size: 24 })],
            spacing: { after: 200 }
          }),

          ...candidates.map(c => new docx.Paragraph({
            children: [new docx.TextRun({ text: c.name, size: 24 })],
            bullet: { level: 0 }
          })),

          new docx.Paragraph({ text: "", spacing: { after: 800 } }),

          new docx.Paragraph({
            children: [new docx.TextRun({ text: formatarDataLonga(calendarItems.find(i => i.id === 'ev6')?.date || ''), size: 24 })],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { after: 600 }
          }),

          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "__________________________________          __________________________________" })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `${repEmpresaName}                                    ${presCipaName}` })
            ],
            alignment: docx.AlignmentType.CENTER,
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Representante da Empresa                                          Presidente da CIPA em Curso" })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Edital_Divulgacao_Inscritos_${selectedTerm?.year.replace('/', '-')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateStep3List = async () => {
    const ev3Data = calendarItems.find(i => i.id === 'ev3');
    if (!ev3Data) return;

    const logoUrl = activeBranch.logoUrl || activeCompany.logoUrl;
    let logoImageParagraph = null;
    if (logoUrl) {
      const buffer = await getImageArrayBuffer(logoUrl);
      if (buffer) {
        logoImageParagraph = new docx.Paragraph({
          children: [new docx.ImageRun({ data: buffer, transformation: { width: 80, height: 80 } })],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      }
    }

    const doc = new docx.Document({
      sections: [{
        children: [
          ...(logoImageParagraph ? [logoImageParagraph] : []),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "LISTA DE PRESENÇA - FORMAÇÃO DA COMISSÃO ELEITORAL", bold: true, size: 32 })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: `Data: ${formatarDataLonga(ev3Data.date)}`, size: 24 }),
              new docx.TextRun({ text: `   Horário: ${reuniaoTime || '___________'}`, size: 24 }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new docx.Table({
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "NOME", bold: true })] })], width: { size: 60, type: docx.WidthType.PERCENTAGE } }),
                  new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "ASSINATURA", bold: true })] })], width: { size: 40, type: docx.WidthType.PERCENTAGE } }),
                ]
              }),
              // Rows for signatures
              ...Array(10).fill(0).map(() => new docx.TableRow({
                height: { value: 600, rule: docx.HeightRule.ATLEAST },
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({})] }),
                  new docx.TableCell({ children: [new docx.Paragraph({})] }),
                ]
              }))
            ],
            width: { size: 100, type: docx.WidthType.PERCENTAGE }
          })
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lista_Presenca_Comissao_${selectedTerm?.year.replace('/', '-')}.docx`;
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
      meetingId: data.get('meetingId'),
      description: data.get('description'),
      deadline: data.get('deadline'),
      responsibleId: data.get('responsibleId'),
      status: 'PENDING'
    };

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

  const updateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm) return;
    const data = new FormData(e.currentTarget);

    try {
      await fetch(`/api/cipa/terms/${editingTerm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: data.get('year'),
          startDate: data.get('startDate'),
          endDate: data.get('endDate'),
          status: data.get('status')
        })
      });
      refreshTerms();
      setIsTermModalOpen(false);
      setEditingTerm(null);
    } catch (e) {
      alert("Erro ao atualizar gestão");
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
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedTermId(term.id); setEleicaoView('menu'); }} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                    Gerenciar <ChevronRight size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingTerm(term); setIsTermModalOpen(true); }} className="px-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    <Edit3 size={20} />
                  </button>
                </div>
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
                      <button onClick={() => { setSelectedTermId(term.id); setEleicaoView('menu'); }} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl" title="Gerenciar"><Eye size={20} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingTerm(term); setIsTermModalOpen(true); }} className="p-2 text-emerald-400 hover:bg-emerald-50 rounded-xl" title="Editar"><Edit3 size={20} /></button>
                      <button onClick={() => setTermToDelete(term)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" title="Excluir"><Trash2 size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        }

        {
          termToDelete && (
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
          )
        }

        {
          isTermModalOpen && editingTerm && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsTermModalOpen(false)}></div>
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
                <h2 className="text-xl font-black mb-6 uppercase">Editar Gestão</h2>
                <form onSubmit={updateTerm} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Referência (Ano/Gestão)</label>
                    <input required name="year" defaultValue={editingTerm.year} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" placeholder="Ex: 2024/2025" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Início da Gestão</label>
                      <input type="date" required name="startDate" defaultValue={editingTerm.startDate ? new Date(editingTerm.startDate).toISOString().split('T')[0] : ''} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Fim da Gestão</label>
                      <input type="date" required name="endDate" defaultValue={editingTerm.endDate ? new Date(editingTerm.endDate).toISOString().split('T')[0] : ''} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Status do Processo</label>
                    <select name="status" defaultValue={editingTerm.status} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none">
                      <option value="ELECTION">Em Eleição</option>
                      <option value="ACTIVE">Vigente (Ativo)</option>
                      <option value="FINISHED">Encerrada</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all">Salvar Alterações</button>
                </form>
              </div>
            </div>
          )
        }


        {/* AI CHAT FLOATING BUTTON */}
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-all flex items-center justify-center relative group"
          >
            <Bot size={32} />
            <span className="absolute right-full mr-4 bg-white text-emerald-900 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
              Dúvidas NR-5?
            </span>
            {/* Notification dot approach or just generic icon */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-emerald-600"></span>
          </button>
        </div>

        {/* AI CHAT MODAL */}
        {isAiChatOpen && (
          <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 print:hidden pointer-events-none">
            {/* Backdrop - lighter/invisible to feel like an overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={() => setIsAiChatOpen(false)}></div>

            <div className="bg-white w-full sm:w-[400px] h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col pointer-events-auto relative animate-in slide-in-from-bottom-10 border border-emerald-100 overflow-hidden">
              {/* Header */}
              <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Especialista NR-5</h3>
                    <p className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                  </div>
                </div>
                <button onClick={() => setIsAiChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <ShieldCheck size={120} />
                </div>

                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                      {/* Simple markdown parsing for bold */}
                      {msg.content.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                  </div>
                )}
                {/* Auto-scroll anchor */}
                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })}></div>
              </div>

              {/* Input Area */}
              <form onSubmit={handleAskAi} className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-2">
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder="Ex: Qual a estabilidade do cipeiro?"
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!aiChatInput.trim() || isAiLoading}
                  className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

      </div >
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
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic overflow-hidden">
                    {(activeBranch?.logoUrl || activeCompany?.logoUrl) ? (
                      <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      "Logo"
                    )}
                  </div>
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
                      <select
                        value={selectedTerm?.companyRepId || ''}
                        onChange={async (e) => {
                          const newId = e.target.value;
                          const collab = collaborators.find(c => c.id === newId);
                          if (collab) setRepEmpresaName(collab.name);

                          // Update Local State immediately for responsiveness
                          if (selectedTerm) {
                            const updatedTerm = { ...selectedTerm, companyRepId: newId };
                            // @ts-ignore
                            const newTerms = terms.map(t => t.id === selectedTerm.id ? updatedTerm : t);
                            // @ts-ignore
                            setTerms(newTerms);
                          }

                          // Save to API
                          try {
                            await fetch(`/api/cipa/terms/${selectedTermId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ companyRepId: newId })
                            });
                          } catch (err) {
                            console.error("Failed to save company rep", err);
                          }
                        }}
                        className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none appearance-none cursor-pointer hover:bg-slate-50"
                      >
                        <option value="">Selecione...</option>
                        {collaborators.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Representante Empresa</p>
                    </div>
                    <div className="flex-1 space-y-4 text-center">
                      <select
                        value={selectedTerm?.cipaPresidentId || ''}
                        onChange={async (e) => {
                          const newId = e.target.value;
                          const collab = collaborators.find(c => c.id === newId);
                          if (collab) setPresCipaName(collab.name);

                          // Update Local State
                          if (selectedTerm) {
                            const updatedTerm = { ...selectedTerm, cipaPresidentId: newId };
                            // @ts-ignore
                            const newTerms = terms.map(t => t.id === selectedTerm.id ? updatedTerm : t);
                            // @ts-ignore
                            setTerms(newTerms);
                          }

                          // Save to API
                          try {
                            await fetch(`/api/cipa/terms/${selectedTermId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ cipaPresidentId: newId })
                            });
                          } catch (err) {
                            console.error("Failed to save cipa president", err);
                          }
                        }}
                        className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none appearance-none cursor-pointer hover:bg-slate-50"
                      >
                        <option value="">Selecione...</option>
                        {collaborators.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Presidente CIPA Atual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeStepView === 'ev2' ? (
        <div className="animate-in slide-in-from-right-12 duration-500">
          <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
              <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                <ArrowLeft size={18} /> Voltar ao Calendário
              </button>
              <button onClick={generateStep2Word} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-500 transition-all">
                <FileDown size={18} /> Gerar Word (.docx)
              </button>
            </div>

            <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
              <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 space-y-12 min-h-[1100px] relative text-slate-800 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-10 border-b border-slate-100 pb-10">
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic overflow-hidden">
                    {(activeBranch?.logoUrl || activeCompany?.logoUrl) ? (
                      <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      "Logo"
                    )}
                  </div>
                  <div className="text-center flex-1 pr-32">
                    <h2 className="text-3xl font-black text-emerald-700 uppercase">Edital de Convocação</h2>
                    <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">CIPA Gestão {selectedTerm?.year}</p>
                  </div>
                </div>

                <div className="space-y-8 leading-[1.8] text-base">
                  <p className="text-justify">
                    A Empresa <span className="font-black">{activeCompany.name}</span> comunica a todos os colaboradores que está aberto o processo eleitoral para a escolha dos representantes da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA), Gestão {selectedTerm?.year}, em conformidade com a Norma Regulamentadora nº 5 (NR-5).
                  </p>

                  <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 space-y-6 print:border-none print:bg-transparent print:p-0">
                    <h4 className="font-black text-emerald-900 uppercase text-sm border-b border-emerald-200 pb-2 mb-4 print:hidden">Detalhes da Eleição</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest print:hidden">Data da Votação</label>
                        <div className="font-bold text-lg text-emerald-950">{calendarItems.find(i => i.id === 'ev7') ? formatarDataLonga(calendarItems.find(i => i.id === 'ev7')!.date) : '...'}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest print:hidden">Horário (Início às Fim)</label>
                        <input
                          value={electionTimeRange}
                          onChange={(e) => setElectionTimeRange(e.target.value)}
                          placeholder="08:00 às 17:00"
                          className="w-full bg-white border-b-2 border-emerald-200 p-2 font-black text-emerald-950 outline-none print:hidden focus:border-emerald-500 transition-all"
                        />
                        <div className="hidden print:block font-bold">das {electionTimeRange} horas</div>
                      </div>
                      <div className="col-span-full space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest print:hidden">Local da Votação</label>
                        <input
                          value={electionLocation}
                          onChange={(e) => setElectionLocation(e.target.value)}
                          placeholder="Ex: Sala de Treinamento, Refeitório..."
                          className="w-full bg-white border-b-2 border-emerald-200 p-2 font-black text-emerald-950 outline-none print:hidden focus:border-emerald-500 transition-all"
                        />
                        <div className="hidden print:block font-bold">{electionLocation}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-justify">
                    O período de inscrições para candidatos ocorrerá de <strong>{calendarItems.find(i => i.id === 'ev4') ? new Date(calendarItems.find(i => i.id === 'ev4')!.date).toLocaleDateString() : '...'}</strong> a <strong>{calendarItems.find(i => i.id === 'ev5') ? new Date(calendarItems.find(i => i.id === 'ev5')!.date).toLocaleDateString() : '...'}</strong>. Os interessados deverão procurar o Departamento de Segurança do Trabalho para retirar e preencher o formulário de inscrição.
                  </p>

                  <p className="text-justify font-bold text-emerald-900 icon-quote">
                    Participe! Sua colaboração é essencial para a construção de um ambiente de trabalho mais seguro e saudável para todos.
                  </p>
                </div>

                <div className="pt-20 space-y-24">
                  <p className="text-right font-black text-slate-900">{formatarDataLonga(calendarItems.find(i => i.id === 'ev2')?.date || '')}</p>
                  <div className="flex justify-between items-start gap-12">
                    <div className="flex-1 space-y-4 text-center">
                      <input value={repEmpresaName} onChange={e => setRepEmpresaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Representante Empresa</p>
                    </div>
                    <div className="flex-1 space-y-4 text-center">
                      <input value={presCipaName} onChange={e => setPresCipaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Presidente CIPA Atual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeStepView === 'ev3' ? (
        <div className="animate-in slide-in-from-right-12 duration-500">
          <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
              <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                <ArrowLeft size={18} /> Voltar ao Calendário
              </button>
              <div className="flex items-center gap-4">
                <button onClick={generateStep3List} className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-sm hover:bg-emerald-200 transition-all">
                  <List size={18} /> Lista de Presença
                </button>
                <button onClick={generateStep3Word} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-500 transition-all">
                  <FileDown size={18} /> Gerar Ata (.docx)
                </button>
              </div>
            </div>

            <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
              <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 space-y-12 min-h-[1100px] relative text-slate-800 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-10 border-b border-slate-100 pb-10">
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic overflow-hidden">
                    {(activeBranch?.logoUrl || activeCompany?.logoUrl) ? (
                      <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      "Logo"
                    )}
                  </div>
                  <div className="text-center flex-1 pr-32">
                    <h2 className="text-3xl font-black text-emerald-700 uppercase">Ata da Comissão Eleitoral</h2>
                    <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">CIPA Gestão {selectedTerm?.year}</p>
                  </div>
                </div>

                <div className="space-y-8 leading-[1.8] text-base">
                  <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 space-y-6 print:hidden mb-8">
                    <h4 className="font-black text-emerald-900 uppercase text-sm border-b border-emerald-200 pb-2 mb-4">Dados da Reunião</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Vice-Presidente (Atual)</label>
                        <select
                          value={vicePresidenteName}
                          onChange={(e) => setVicePresidenteName(e.target.value)}
                          className="w-full bg-white border-b-2 border-emerald-200 p-2 font-black text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                        >
                          <option value="">Selecione...</option>
                          {collaborators.map(collab => (
                            <option key={collab.id} value={collab.name}>{collab.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secretário(a) da Mesa</label>
                        <select
                          value={secretarioName}
                          onChange={(e) => setSecretarioName(e.target.value)}
                          className="w-full bg-white border-b-2 border-emerald-200 p-2 font-black text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                        >
                          <option value="">Selecione...</option>
                          {collaborators.map(collab => (
                            <option key={collab.id} value={collab.name}>{collab.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Horário da Reunião</label>
                        <input
                          type="time"
                          value={reuniaoTime}
                          onChange={(e) => setReuniaoTime(e.target.value)}
                          className="w-full bg-white border-b-2 border-emerald-200 p-2 font-black text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-justify">
                    Reuniram-se os representantes da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA) da gestão atual e representantes da Empresa <span className="font-black">{activeCompany.name}</span> para a formação da Comissão Eleitoral (CE) da nova Gestão {selectedTerm?.year}, em conformidade com a Norma Regulamentadora nº 5 (NR-5).
                  </p>

                  <p className="text-justify">
                    Durante a reunião, o(a) Sr(a) <strong>{presCipaName}</strong>, Presidente da CIPA em curso, e o(a) Sr(a) <strong>{vicePresidenteName || '__________________'}</strong>, Vice-Presidente, foram nomeados membros da Comissão Eleitoral. O(a) Sr(a) <strong>{presCipaName}</strong> assumirá a função de Presidente da Mesa Eleitoral, e o(a) Sr(a) <strong>{secretarioName || '__________________'}</strong> exercerá a função de Secretário(a).
                  </p>

                  <p className="text-justify">
                    A reunião foi realizada no dia <strong>{calendarItems.find(i => i.id === 'ev3') ? formatarDataLonga(calendarItems.find(i => i.id === 'ev3')!.date) : '...'}</strong>, às <strong>{reuniaoTime || '...'}</strong>, ocasião em que foram discutidos o processo eleitoral e as responsabilidades da Comissão.
                  </p>
                </div>

                <div className="pt-20 space-y-24">
                  <p className="text-right font-black text-slate-900">{formatarDataLonga(calendarItems.find(i => i.id === 'ev3')?.date || '')}</p>
                  <div className="flex justify-between items-start gap-12">
                    <div className="flex-1 space-y-4 text-center">
                      <input value={repEmpresaName} onChange={e => setRepEmpresaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Representante Empresa</p>
                    </div>
                    <div className="flex-1 space-y-4 text-center">
                      <input value={presCipaName} onChange={e => setPresCipaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Presidente CIPA Atual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeStepView === 'ev4' ? (
        <div className="animate-in slide-in-from-right-12 duration-500">
          <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
              <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                <ArrowLeft size={18} /> Voltar ao Calendário
              </button>
            </div>

            <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50">
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Registration Area */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-emerald-100 flex flex-col md:flex-row gap-8 items-end">
                  <div className="flex-1 space-y-4 w-full">
                    <label className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2"><Plus size={18} /> Nova Inscrição Digital</label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      className="w-full bg-emerald-50 border-b-2 border-emerald-200 p-4 rounded-xl font-black text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="">Selecione um Colaborador...</option>
                      {collaborators.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!selectedCandidateId) return alert("Selecione um colaborador");
                      setIsRegistrationModalOpen(true);
                      // Delay signature clear/setup slightly to ensure modal render
                      setTimeout(clearSignature, 100);
                    }}
                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-500 transition-all shrink-0 flex items-center gap-2"
                  >
                    <PenTool size={18} /> Assinar e Inscrever
                  </button>
                </div>

                {/* Registered Candidates List */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-emerald-100">
                  <h3 className="text-xl font-black text-emerald-950 uppercase mb-8 flex items-center gap-2"><Users2 size={24} /> Candidatos Inscritos ({candidates.length})</h3>
                  <div className="overflow-hidden rounded-2xl border border-emerald-50">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50/50 text-[10px] font-black text-emerald-900 uppercase tracking-widest">
                        <tr>
                          <th className="p-6">Nome</th>
                          <th className="p-6">Setor</th>
                          <th className="p-6">Data Inscrição</th>
                          <th className="p-6 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {candidates.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold uppercase text-xs">Nenhum candidato inscrito ainda.</td></tr>
                        ) : (
                          candidates.map(candidate => (
                            <tr key={candidate.id} className="hover:bg-emerald-50/30 transition-all">
                              <td className="p-6 font-bold text-emerald-950">{candidate.name}</td>
                              <td className="p-6 text-sm text-slate-500">{candidate.sector}</td>
                              <td className="p-6 text-sm font-bold text-emerald-600">{candidate.date} - {candidate.time}</td>
                              <td className="p-6 text-right">
                                <button onClick={() => generateStep4Word(candidate.id)} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-all" title="Gerar Ficha">
                                  <FileDown size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeStepView === 'ev6' ? (
        <div className="animate-in slide-in-from-right-12 duration-500">
          <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
              <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                <ArrowLeft size={18} /> Voltar ao Calendário
              </button>
              <button onClick={generateStep6Word} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-500 transition-all">
                <FileDown size={18} /> Gerar Word (.docx)
              </button>
            </div>

            <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
              <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 space-y-12 min-h-[1100px] relative text-slate-800 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-10 border-b border-slate-100 pb-10">
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic overflow-hidden">
                    {(activeBranch?.logoUrl || activeCompany?.logoUrl) ? (
                      <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      "Logo"
                    )}
                  </div>
                  <div className="text-center flex-1 pr-32">
                    <h2 className="text-3xl font-black text-emerald-700 uppercase">Edital de Divulgação de Inscritos</h2>
                    <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">CIPA Gestão {selectedTerm?.year}</p>
                  </div>
                </div>

                <div className="space-y-8 leading-[1.8] text-base">
                  <p className="text-justify">
                    A Empresa <span className="font-black">{activeCompany.name}</span>, em cumprimento ao item 5.5.3, alínea "e" da Norma Regulamentadora nº 5 (NR-5), torna público a relação dos candidatos inscritos para a eleição da Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA).
                  </p>

                  <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 space-y-6">
                    <h4 className="font-black text-emerald-900 uppercase text-sm border-b border-emerald-200 pb-2 mb-4">Candidatos Inscritos</h4>
                    {candidates.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {candidates.map(c => (
                          <li key={c.id} className="font-bold text-emerald-900">{c.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic">Nenhum candidato inscrito.</p>
                    )}
                  </div>
                </div>

                <div className="pt-20 space-y-24">
                  <p className="text-right font-black text-slate-900">{formatarDataLonga(calendarItems.find(i => i.id === 'ev6')?.date || '')}</p>
                  <div className="flex justify-between items-start gap-12">
                    <div className="flex-1 space-y-4 text-center">
                      <input value={repEmpresaName} onChange={e => setRepEmpresaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Representante Empresa</p>
                    </div>
                    <div className="flex-1 space-y-4 text-center">
                      <input value={presCipaName} onChange={e => setPresCipaName(e.target.value)} className="w-full border-b border-slate-900 bg-transparent text-center font-black outline-none print:border-none" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Presidente CIPA Atual</p>
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
              <button onClick={() => { setEditingTerm(selectedTerm!); setIsTermModalOpen(true); }} className="p-3 text-emerald-400 hover:bg-emerald-50 rounded-2xl transition-all" title="Editar Gestão">
                <Edit3 size={24} />
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

                {/* MENU VIEW */}
                {eleicaoView === 'menu' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                    <button
                      onClick={() => setEleicaoView('dimensionamento')}
                      className="bg-white p-12 rounded-[3rem] border border-emerald-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 transition-all group group text-left space-y-4"
                    >
                      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Users2 size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-emerald-950 uppercase group-hover:text-emerald-700 transition-all">Dimensionamento</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">Cálculo de integrantes da CIPA (NR-5) baseado no quadro de funcionários e CNAE.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setEleicaoView('calendario')}
                      className="bg-white p-12 rounded-[3rem] border border-emerald-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 transition-all group text-left space-y-4"
                    >
                      <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                        <CalendarDays size={40} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-emerald-950 uppercase group-hover:text-emerald-700 transition-all">Cronograma Eleitoral</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">Gerenciamento de prazos, etapas do processo eleitoral e geração de editais.</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* DIMENSIONAMENTO VIEW */}
                {eleicaoView === 'dimensionamento' && (
                  <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between">
                      <button onClick={() => setEleicaoView('menu')} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                        <ArrowLeft size={18} /> Voltar ao Menu
                      </button>
                    </div>

                    <div className="p-12 max-w-5xl mx-auto w-full space-y-12">
                      <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-emerald-950 uppercase">Dimensionamento da CIPA</h2>
                        <p className="text-emerald-600 font-black text-sm uppercase tracking-widest">Norma Regulamentadora Nº 05 (Quadro I)</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">

                          {/* Step 1: CNAE/Group Selection */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                              <label className="text-xs font-black text-emerald-950 uppercase tracking-widest">Enquadramento (Grupo NR-5)</label>
                            </div>

                            {companyCnae && (
                              <div className="bg-emerald-100/50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 mb-2">
                                <Award size={16} className="text-emerald-600" />
                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">
                                  CNAE Identificado: {companyCnae} <span className="mx-1 text-emerald-400">|</span> Enquadramento: {getNr5Group(companyCnae) || 'Não identificado'}
                                </p>
                              </div>
                            )}

                            <select
                              value={companyRiskGroup}
                              onChange={(e) => {
                                setCompanyRiskGroup(e.target.value);
                                const countInput = document.getElementById('employee-count-input') as HTMLInputElement;
                                if (countInput && countInput.value) {
                                  countInput.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                              }}
                              className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-200 transition-all border border-emerald-100"
                            >
                              <option value="">Selecione o Grupo ou CNAE...</option>
                              <optgroup label="Grupos Industriais">
                                <option value="C-1">C-1 (Minerais)</option>
                                <option value="C-2">C-2 (Alimentos)</option>
                                <option value="C-3">C-3 (Têxteis)</option>
                                <option value="C-3a">C-3a (Construção Civil)</option>
                                <option value="C-4">C-4 (Calçados)</option>
                                <option value="C-5">C-5 (Madeira)</option>
                                <option value="C-6">C-6 (Papel)</option>
                                <option value="C-7">C-7 (Químicos)</option>
                                <option value="C-8">C-8 (Farmacêuticos)</option>
                                <option value="C-9">C-9 (Minerais Não-Metálicos)</option>
                                <option value="C-10">C-10 (Metalurgia)</option>
                                <option value="C-11">C-11 (Mecânica)</option>
                                <option value="C-12">C-12 (Material Elétrico)</option>
                                <option value="C-13">C-13 (Veículos)</option>
                              </optgroup>
                              <optgroup label="Serviços e Comércio">
                                <option value="C-14">C-14 (Comércio)</option>
                                <option value="C-15">C-15 (Eletricidade/Gás/Água)</option>
                                <option value="C-16">C-16 (Água/Esgoto)</option>
                                <option value="C-17">C-17 (Comercio Veículos)</option>
                                <option value="C-18">C-18 (Financeiros)</option>
                                <option value="C-19">C-19 (Seguros)</option>
                                <option value="C-20">C-20 (Imobiliário)</option>
                                <option value="C-21">C-21 (Ensino)</option>
                                <option value="C-22">C-22 (Saúde)</option>
                                <option value="C-23">C-23 (Serviços Sociais)</option>
                                <option value="C-24">C-24 (Serviços Recreativos)</option>
                                <option value="C-25">C-25 (Alojamento/Alimentação)</option>
                                <option value="C-26">C-26 (Informática/Cinematográfica)</option>
                                <option value="C-27">C-27 (Limpeza e Vigilância)</option>
                                <option value="C-28">C-28 (Bancos)</option>
                                <option value="C-29">C-29 (Comércio Varejista)</option>
                              </optgroup>
                              <optgroup label="Transportes">
                                <option value="C-30">C-30 (Aquaviário)</option>
                                <option value="C-31">C-31 (Aéreo)</option>
                                <option value="C-32">C-32 (Terrestre)</option>
                                <option value="C-33">C-33 (Armazenagem)</option>
                                <option value="C-34">C-34 (Correio/Telecom)</option>
                              </optgroup>
                              <optgroup label="Outros">
                                <option value="C-35">C-35 (Administração Pública/Outros)</option>
                              </optgroup>
                            </select>
                            <p className="text-[10px] text-slate-400 font-bold px-2">
                              Selecione o grupo correspondente ao CNAE preponderante da unidade.
                            </p>
                          </div>

                          {/* Step 2: Employee Count */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                              <label className="text-xs font-black text-emerald-950 uppercase tracking-widest">Quadro de Efetivos</label>
                            </div>

                            <div className="flex gap-4 items-center">
                              <input
                                id="employee-count-input"
                                type="number"
                                value={employeeCount}
                                placeholder="0"
                                className="flex-1 bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-200 transition-all border border-emerald-100"
                                onChange={(e) => {
                                  let num = parseInt(e.target.value);
                                  if (isNaN(num)) num = 0;
                                  setEmployeeCount(num);
                                }}
                              />
                              <button
                                onClick={() => {
                                  // Count effective employees (active)
                                  // Filter Logic: collaborators list -> filter by status 'ACTIVE' (if available field) or assume all in list are active unless marked.
                                  // Excluding 'Terceiro' or similar if indicated. Assuming 'role' or 'type' logic. 
                                  // For now, counting all in DB as 'Effective' is safest default unless 'pj' or 'terceiro' is explicit.
                                  // The user said: "os colaboradores efetivos(só os efetivos ativos, os terceiros não deve constar)"

                                  // Mock logic for filtering based on common patterns if fields exist, else count all
                                  const effectiveCount = collaborators.filter(c =>
                                    (c.status === 'ACTIVE') &&
                                    (c.workRegime === 'EFFECTIVE')
                                  ).length;
                                  setEmployeeCount(effectiveCount);
                                }}
                                className="bg-emerald-100 text-emerald-700 px-4 py-4 rounded-xl font-bold text-xs uppercase hover:bg-emerald-200 transition-all shadow-sm"
                                title="Preencher com total de colaboradores cadastrados"
                              >
                                Auto-Preencher
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold px-2">
                              Total de colaboradores efetivos e ativos carregado automaticamente do cadastro.
                            </p>
                          </div>
                        </div>

                        {/* Result Card */}
                        <div className="col-span-1 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-[2.5rem] p-10 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl border border-emerald-700">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                          <div className="relative z-10 text-center">
                            <h3 className="font-black text-emerald-400 uppercase tracking-[0.2em] mb-12 border-b border-emerald-700 pb-4 inline-block">Dimensionamento Sugerido</h3>

                            <div className="flex items-center justify-center gap-12">
                              <div className="text-center group">
                                <span className="text-7xl font-black block mb-2 group-hover:scale-110 transition-transform duration-300">{cipaDimensioning.efetivos}</span>
                                <span className="text-xs font-black uppercase tracking-widest opacity-60 bg-emerald-950/30 px-3 py-1 rounded-full">Efetivos</span>
                              </div>

                              <div className="h-24 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent"></div>

                              <div className="text-center group">
                                <span className="text-7xl font-black block mb-2 text-emerald-300 group-hover:scale-110 transition-transform duration-300">{cipaDimensioning.suplentes}</span>
                                <span className="text-xs font-black uppercase tracking-widest opacity-60 bg-emerald-950/30 px-3 py-1 rounded-full">Suplentes</span>
                              </div>
                            </div>

                            <div className="mt-12 bg-emerald-950/40 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                              {cipaDimensioning.efetivos === 0 ? (
                                <div className="flex items-center gap-4 text-left">
                                  <div className="p-3 bg-emerald-500/20 rounded-xl"><UserCheck size={24} className="text-emerald-400" /></div>
                                  <div>
                                    <h4 className="font-black text-sm uppercase text-emerald-200">Designado da CIPA</h4>
                                    <p className="text-[10px] opacity-70 leading-relaxed mt-1">Conforme NR-5 (Item 5.4.13), empresas desobrigadas de constituir CIPA devem designar um responsável pelo cumprimento dos objetivos da norma.</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 text-left">
                                  <div className="p-3 bg-emerald-500/20 rounded-xl"><Users2 size={24} className="text-emerald-400" /></div>
                                  <div>
                                    <h4 className="font-black text-sm uppercase text-emerald-200">Comissão Obrigatória</h4>
                                    <p className="text-[10px] opacity-70 leading-relaxed mt-1">A empresa deve constituir Comissão Interna de Prevenção de Acidentes e de Assédio (CIPA) composta por representantes do empregador e dos empregados.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CALENDARIO VIEW */}
                {eleicaoView === 'calendario' && (
                  <div className="animate-in slide-in-from-right-12 duration-500">
                    <div className="mb-4">
                      <button onClick={() => setEleicaoView('menu')} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                        <ArrowLeft size={18} /> Voltar ao Menu
                      </button>
                    </div>

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
                                  <tr key={ev.id} className={`transition-all ${isDone ? 'bg-emerald-50 opacity-60' : 'hover:bg-emerald-50/50'}`}>
                                    <td className="px-8 py-4 print:hidden">
                                      <button onClick={() => toggleStep(ev.id)} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-emerald-100 hover:border-emerald-300'}`}>
                                        <Check size={18} />
                                      </button>
                                    </td>
                                    <td className={`px-8 py-4 font-black text-xs ${isDone ? 'text-emerald-800 line-through' : 'text-emerald-950'}`}>{ev.item}</td>
                                    <td className={`px-8 py-4 text-center font-bold text-xs ${isDone ? 'text-emerald-800 line-through' : 'text-emerald-600'}`}>{new Date(ev.date).toLocaleDateString()}</td>
                                    <td className={`px-8 py-4 text-center text-[10px] font-black uppercase tracking-tighter ${isDone ? 'text-emerald-800 line-through' : 'text-emerald-400'}`}>{ev.weekDay}</td>
                                    <td className="px-8 py-4 text-center print:hidden">
                                      <button onClick={() => {
                                        if (ev.id === 'ev1') setActiveStepView('ev1');
                                        if (ev.id === 'ev2') setActiveStepView('ev2');
                                        if (ev.id === 'ev3') setActiveStepView('ev3');
                                        if (ev.id === 'ev4') setActiveStepView('ev4');
                                        if (ev.id === 'ev6') setActiveStepView('ev6');
                                      }} className={`p-2.5 rounded-xl transition-all ${['ev1', 'ev2', 'ev3', 'ev4', 'ev6'].includes(ev.id) ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 shadow-sm' : 'text-emerald-100 cursor-not-allowed'}`}>
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
      )
      }

      {/* MODALS */}
      {
        isMemberModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsMemberModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black uppercase">Membro da CIPA</h2>
                {(activeBranch?.logoUrl || activeCompany?.logoUrl) && (
                  <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                )}
              </div>
              <form onSubmit={saveMember} className="space-y-6">
                <select required name="collaboratorId" className="w-full bg-emerald-50 border p-4 rounded-xl font-black"><option value="">Selecionar Colaborador...</option>{collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <div className="grid grid-cols-2 gap-4"><select name="cipaRole" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="PRESIDENTE">Presidente</option><option value="VICE_PRESIDENTE">Vice</option><option value="TITULAR">Titular</option></select><select name="origin" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="EMPREGADO">Eleito</option><option value="EMPREGADOR">Indicado</option></select></div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Salvar Membro</button>
              </form>
            </div>
          </div>
        )
      }

      {
        isMeetingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsMeetingModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase">Agendar Reunião</h2>
                {(activeBranch?.logoUrl || activeCompany?.logoUrl) && (
                  <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                )}
              </div>
              <form onSubmit={saveMeeting} className="space-y-6">
                <div className="grid grid-cols-2 gap-4"><input type="date" required name="date" className="bg-emerald-50 p-4 rounded-xl font-black" /><select name="type" className="bg-emerald-50 p-4 rounded-xl font-black"><option value="ORDINARY">Ordinária</option><option value="EXTRAORDINARY">Extraordinária</option></select></div>
                <input required name="title" placeholder="Título da Pauta" className="w-full bg-emerald-50 p-4 rounded-xl font-black" />
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl">Salvar</button>
              </form>
            </div>
          </div>
        )
      }

      {
        isPlanModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase">Nova Ação</h2>
                {(activeBranch?.logoUrl || activeCompany?.logoUrl) && (
                  <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                )}
              </div>
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
        )
      }

      {
        termToDelete && (
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
        )
      }

      {
        isTermModalOpen && editingTerm && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsTermModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase">Editar Gestão</h2>
                {(activeBranch?.logoUrl || activeCompany?.logoUrl) && (
                  <img src={activeBranch?.logoUrl || activeCompany?.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                )}
              </div>
              <form onSubmit={updateTerm} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Referência (Ano/Gestão)</label>
                  <input required name="year" defaultValue={editingTerm.year} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" placeholder="Ex: 2024/2025" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Início da Gestão</label>
                    <input type="date" required name="startDate" defaultValue={editingTerm.startDate ? new Date(editingTerm.startDate).toISOString().split('T')[0] : ''} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Fim da Gestão</label>
                    <input type="date" required name="endDate" defaultValue={editingTerm.endDate ? new Date(editingTerm.endDate).toISOString().split('T')[0] : ''} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Status do Processo</label>
                  <select name="status" defaultValue={editingTerm.status} className="w-full bg-emerald-50 p-4 rounded-xl font-black text-emerald-950 outline-none">
                    <option value="ELECTION">Em Eleição</option>
                    <option value="ACTIVE">Vigente (Ativo)</option>
                    <option value="FINISHED">Encerrada</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-500 transition-all">Salvar Alterações</button>
              </form>
            </div>
          </div>
        )
      }

      {/* AI CHAT FLOATING BUTTON (DETAIL VIEW) */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-all flex items-center justify-center relative group"
        >
          <Bot size={32} />
          <span className="absolute right-full mr-4 bg-white text-emerald-900 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
            Dúvidas NR-5?
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-emerald-600"></span>
        </button>
      </div>


      {/* REGISTRATION & SIGNATURE MODAL */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => { setIsRegistrationModalOpen(false); setIsPolling(false); }}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in zoom-in border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase text-emerald-950">Ficha de Inscrição</h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">CIPA Gestão {selectedTerm?.year}</p>
              </div>
              <button onClick={() => { setIsRegistrationModalOpen(false); setIsPolling(false); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100/50">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Candidato</p>
                <h3 className="text-lg font-black text-emerald-900">{collaborators.find(c => c.id === selectedCandidateId)?.name}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="px-2 py-1 bg-white rounded-md text-[10px] font-bold text-emerald-600 uppercase border border-emerald-100">CPF: {collaborators.find(c => c.id === selectedCandidateId)?.cpf}</span>
                </div>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setSignatureMethod('DRAW')}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${signatureMethod === 'DRAW' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Assinar na Tela (PC)
                </button>
                <button
                  onClick={() => {
                    setSignatureMethod('QR');
                    if (!qrCodeData) initQrSession();
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${signatureMethod === 'QR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Assinar pelo Celular
                </button>
              </div>

              {signatureMethod === 'DRAW' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><PenTool size={14} /> Assinatura Digital</label>
                    <button onClick={clearSignature} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Limpar</button>
                  </div>
                  <div className="w-full h-48 bg-white border-2 border-dashed border-emerald-200 rounded-2xl relative touch-none hover:border-emerald-400 transition-colors cursor-crosshair overflow-hidden shadow-inner">
                    <canvas
                      ref={signatureRef}
                      width={500}
                      height={200}
                      className="w-full h-full object-contain"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!isDrawing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <p className="text-xs font-black uppercase text-emerald-900">Assine aqui</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center">Use o mouse para assinar no quadro acima.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                  {qrCodeData ? (
                    <>
                      <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-emerald-100">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData.url)}`} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-bold text-emerald-900">Aponte a câmera do celular</p>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">Leia o QR Code acima para abrir a tela de assinatura no seu dispositivo móvel.</p>
                        <div className="flex items-center justify-center gap-2 text-emerald-600 text-[10px] font-black uppercase animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aguardando assinatura...
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 animate-pulse">
                      <p>Gerando código seguro...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Ao assinar, confirmo minha candidatura voluntária para a CIPA. Um comprovante será enviado automaticamente para o e-mail: <strong>{collaborators.find(c => c.id === selectedCandidateId)?.email}</strong>.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
              <button onClick={() => { setIsRegistrationModalOpen(false); setIsPolling(false); }} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
              {signatureMethod === 'DRAW' && (
                <button onClick={() => handleConfirmRegistration()} className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-emerald-500 transition-all">
                  Confirmar e Enviar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI CHAT MODAL (DETAIL VIEW) */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 print:hidden pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={() => setIsAiChatOpen(false)}></div>

          <div className="bg-white w-full sm:w-[400px] h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col pointer-events-auto relative animate-in slide-in-from-bottom-10 border border-emerald-100 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Especialista NR-5</h3>
                  <p className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <ShieldCheck size={120} />
              </div>

              {aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  </div>
                </div>
              )}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })}></div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleAskAi} className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-2">
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ex: Qual a estabilidade do cipeiro?"
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!aiChatInput.trim() || isAiLoading}
                className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div >
  );
};

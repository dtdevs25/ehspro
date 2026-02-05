
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
    sector: string;
    role: string;
    date: string;
    time: string;
  }[]>([]);
  const [selectedCandidateCollaborator, setSelectedCandidateCollaborator] = useState('');

  const handleRegisterCandidate = () => {
    if (!selectedCandidateCollaborator) {
      alert("Selecione um colaborador para registrar.");
      return;
    }

    const collaborator = collaborators.find(c => c.name === selectedCandidateCollaborator);
    if (!collaborator) return;

    // Check if already registered
    if (candidates.some(c => c.name === collaborator.name)) {
      alert("Este colaborador já está inscrito como candidato.");
      return;
    }

    const now = new Date();
    const newCandidate = {
      id: Math.random().toString(36).substr(2, 9),
      name: collaborator.name,
      nickname: collaborator.name.split(' ')[0], // Simple nickname logic
      sector: collaborator.sector || 'Operacional',
      role: collaborator.jobTitle || 'Colaborador',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setCandidates([...candidates, newCandidate]);
    setSelectedCandidateCollaborator('');
    alert("Candidatura confirmada com sucesso!");
  };

  const generateStep4Word = async (candidateId?: string) => {
    const candidateToPrint = candidateId
      ? candidates.find(c => c.id === candidateId)
      : candidates[candidates.length - 1]; // Default to last if not specified

    if (!candidateToPrint) {
      alert("Nenhum candidato selecionado para gerar a ficha.");
      return;
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
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Candidato:" })], width: { size: 20, type: docx.WidthType.PERCENTAGE } }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.name, bold: true })] })] }),
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
              new docx.TableRow({ children: [new docx.TableCell({ children: [new docx.Paragraph({ text: "Candidato:" })], width: { size: 20, type: docx.WidthType.PERCENTAGE } }), new docx.TableCell({ children: [new docx.Paragraph({ text: candidateToPrint.name, bold: true })] })] }),
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
      setRepEmpresaName(activeBranch.name + " Resp.");
      setPresCipaName("Presidente da Gestão Atual");

      // Auto-set baseDate for calendar based on Term's Start Date
      // The generator adds 1 year to baseDate to find target.
      // So we set baseDate = startDate - 1 year.
      if (selectedTerm.startDate) {
        const startDate = new Date(selectedTerm.startDate);
        // Adjust to Brasilia Timezone logic for calculation
        // We want the 'baseDate' input to represent 1 year before startDate.

        const prevYearDate = new Date(startDate);
        prevYearDate.setFullYear(prevYearDate.getFullYear() - 1);

        // Format to YYYY-MM-DD
        const formatted = prevYearDate.toISOString().split('T')[0];
        setBaseDate(formatted);
        setIsCalendarGenerated(true);
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

    const doc = new docx.Document({
      sections: [{
        children: [
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

  window.URL.revokeObjectURL(url);
};

const generateStep5Word = async () => {
  if (candidates.length === 0) {
    alert("Não há candidatos inscritos para gerar o edital.");
    return;
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
          children: [new docx.TextRun({ text: formatarDataLonga(calendarItems.find(i => i.id === 'ev5')?.date || ''), size: 24 })],
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

  const doc = new docx.Document({
    sections: [{
      children: [
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
                <button onClick={() => setSelectedTermId(term.id)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
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
                    <button onClick={() => setSelectedTermId(term.id)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl" title="Gerenciar"><Eye size={20} /></button>
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
                <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic">Logo</div>
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
                <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic">Logo</div>
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
                  <label className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2"><Plus size={18} /> Nova Inscrição</label>
                  <select
                    value={selectedCandidateCollaborator}
                    onChange={(e) => setSelectedCandidateCollaborator(e.target.value)}
                    className="w-full bg-emerald-50 border-b-2 border-emerald-200 p-4 rounded-xl font-black text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Selecione um Colaborador...</option>
                    {collaborators.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleRegisterCandidate} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-emerald-500 transition-all shrink-0">
                  Confirmar Candidatura
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
        ) : activeStepView === 'ev5' ? (
        <div className="animate-in slide-in-from-right-12 duration-500">
          <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between print:hidden">
              <button onClick={() => setActiveStepView(null)} className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase hover:text-emerald-800 transition-all">
                <ArrowLeft size={18} /> Voltar ao Calendário
              </button>
              <button onClick={generateStep5Word} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-emerald-500 transition-all">
                <FileDown size={18} /> Gerar Word (.docx)
              </button>
            </div>

            <div className="flex-1 p-10 md:p-20 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
              <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl p-16 space-y-12 min-h-[1100px] relative text-slate-800 print:shadow-none print:border-none print:p-0">
                <div className="flex items-center gap-10 border-b border-slate-100 pb-10">
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold border border-slate-100 shrink-0 uppercase italic">Logo</div>
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
                  <p className="text-right font-black text-slate-900">{formatarDataLonga(calendarItems.find(i => i.id === 'ev5')?.date || '')}</p>
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
                                    if (ev.id === 'ev3') setActiveStepView('ev3');
                                    if (ev.id === 'ev4') setActiveStepView('ev4');
                                    if (ev.id === 'ev5') setActiveStepView('ev5');
                                  }} className={`p-2.5 rounded-xl transition-all ${['ev1', 'ev2', 'ev3', 'ev4', 'ev5'].includes(ev.id) ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 shadow-sm' : 'text-emerald-100 cursor-not-allowed'}`}>
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
        )
      }

        {/* MODALS */}
        {
          isMemberModalOpen && (
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
          )
        }

        {
          isMeetingModalOpen && (
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
          )
        }

        {
          isPlanModalOpen && (
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
      </div >
    );
};

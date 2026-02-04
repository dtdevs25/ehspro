
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info, Plus } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Collaborator } from '../../../types';

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (data: Collaborator[]) => void;
  existingRegistrationCount: number;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onImport, existingRegistrationCount, currentData = [] }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cabeçalhos para o modelo CSV
  const headers = [
    'nome', 'cpf', 'rg', 'data_nascimento', 'cidade_nascimento', 'estado_nascimento',
    'nome_mae', 'nome_pai', 'escolaridade', 'estado_civil', 'genero', 'raca',
    'endereco', 'telefone', 'email', 'data_admissao', 'id_cargo', 'id_funcao',
    'id_empresa', 'id_unidade', 'regime_trabalho', 'codigo_esocial'
  ];

  const downloadTemplate = () => {
    // Delimitador ; para Excel BR
    let csvContent = headers.join(";") + "\n";

    // Add existing data if available
    if (currentData.length > 0) {
      csvContent += currentData.map(c => {
        return [
          c.name, c.cpf, c.rg, c.birthDate, c.birthPlace, c.birthState,
          c.motherName, c.fatherName, c.education, c.maritalStatus, c.gender, c.race,
          c.address, c.phone, c.email, c.admissionDate, c.roleId, c.functionId,
          c.companyId, c.branchId, c.workRegime, c.eSocialCode
        ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(";"); // Escape quotes and use semicolon
      }).join("\n");
    } else {
      // Add example row
      csvContent += "Exemplo Nome;000.000.000-00;00.000.000-0;1990-01-01;Sao Paulo;SP;Mae Exemplo;Pai Exemplo;Superior Completo;Solteiro(a);Masculino;Parda;Rua Exemplo 123;11999998888;exemplo@email.com;2023-01-01;1;1;c1;b1;EFFECTIVE;S-2200-001\n";
    }

    // Blob with BOM for UTF-8 Excel support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dados_colaboradores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic CSV check
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        setError("Por favor, selecione um arquivo no formato CSV.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const dataRows = rows.slice(1); // Remove header

        const parsedData = dataRows.map((row, index) => {
          // Detect separator
          const separator = row.includes(';') ? ';' : ',';

          // Robust split for quoted CSV (simple fallback if complex quotes exist)
          // For now, simple split + cleanup quotes
          const values = row.split(separator).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

          return {
            id: Math.random().toString(36).substr(2, 9),
            registration: (existingRegistrationCount + index + 1).toString(),
            name: values[0] || '',
            cpf: values[1] || '',
            rg: values[2] || '',
            birthDate: values[3] || '',
            birthPlace: values[4] || '',
            birthState: values[5] || 'SP',
            motherName: values[6] || '',
            fatherName: values[7] || '',
            education: values[8] || '',
            maritalStatus: values[9] || '',
            gender: values[10] || '',
            race: values[11] || '',
            address: values[12] || '',
            phone: values[13] || '',
            email: values[14] || '',
            admissionDate: values[15] || new Date().toISOString().split('T')[0],
            roleId: values[16] || '1',
            functionId: values[17] || '1',
            companyId: values[18] || 'c1',
            branchId: values[19] || 'b1',
            workRegime: (values[20] as any) || 'EFFECTIVE',
            eSocialCode: values[21] || '',
            status: 'ACTIVE' as const,
            isDisabled: false,
            nationality: 'Brasileira'
          };
        }).filter(item => item.name && item.cpf); // Basic validity check

        // Check for duplicates in PREVIEW compared to CURRENT DATA
        const duplicates = parsedData.filter(d => currentData.some(c => c.cpf === d.cpf));
        setDuplicateCount(duplicates.length);
        setImportedCount(parsedData.length - duplicates.length);

        setPreviewData(parsedData);
        setIsProcessing(false);
      } catch (err) {
        setError("Erro ao processar arquivo. Verifique se o formato está correto.");
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    // Filter out duplicates before importing
    const newItems = previewData.filter(d => !currentData.some(c => c.cpf === d.cpf));

    if (newItems.length > 0) {
      onImport(newItems);
    }

    if (duplicateCount > 0) {
      alert(`${duplicateCount} registros ignorados pois já existem no sistema.`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">
        <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950">Importação em Massa</h2>
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Alimente o sistema com múltiplos prontuários</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Passo 1: Download */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0 text-sm">1</div>
            <div className="space-y-2">
              <h4 className="font-black text-emerald-950 uppercase tracking-tight text-sm">Baixe a Planilha Modelo</h4>
              <p className="text-xs text-emerald-600/70 font-medium">
                {currentData.length > 0
                  ? "Baixe o arquivo contendo todos os registros atuais para edição ou referência."
                  : "Use nosso arquivo padronizado para garantir que todos os dados sejam lidos corretamente."}
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-emerald-600 bg-white border border-emerald-200 px-4 py-2 rounded-lg font-black text-[10px] hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-wider"
              >
                <Download size={14} /> {currentData.length > 0 ? "Exportar Dados (.CSV)" : "Baixar Modelo .CSV"}
              </button>
            </div>
          </div>

          {/* Passo 2: Upload */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0 text-sm">2</div>
            <div className="space-y-3 flex-1">
              <h4 className="font-black text-emerald-950 uppercase tracking-tight text-sm">Envie seu Arquivo Preenchido</h4>
              <p className="text-xs text-emerald-500 font-medium">O sistema validará automaticamente duplicatas pelo CPF.</p>

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
                >
                  <Upload size={32} className="text-emerald-300 group-hover:text-emerald-500 transition-colors mb-3" />
                  <p className="text-emerald-900 font-black text-xs uppercase tracking-tighter">Clique ou arraste o arquivo aqui</p>
                  <p className="text-emerald-400 text-[10px] font-bold mt-1">Suporta apenas arquivos .CSV</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-emerald-600 p-4 rounded-xl text-white flex items-center justify-between shadow-lg shadow-emerald-200 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-black text-xs truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                          {isProcessing ? 'Processando...' : `${previewData.length} lidos • ${importedCount} novos`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setFile(null); setPreviewData([]); setDuplicateCount(0); }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {duplicateCount > 0 && (
                    <div className="bg-amber-100 text-amber-700 p-3 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center gap-2">
                      <AlertCircle size={14} />
                      {duplicateCount} registro(s) já existem e serão ignorados.
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-in shake duration-500">
                  <AlertCircle size={16} />
                  <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-emerald-600/50">
            <Info size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Registros Novos: {importedCount}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 font-black text-[10px] text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all">Cancelar</button>
            <button
              disabled={!file || importedCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info, Plus } from 'lucide-react';

interface BulkImportSimpleModalProps {
  onClose: () => void;
  onImport: (data: any[]) => void;
  type: 'Cargos' | 'Funções';
  existingCount: number;
  currentItems?: any[];
}

export const BulkImportSimpleModal: React.FC<BulkImportSimpleModalProps> = ({ onClose, onImport, type, existingCount, currentItems = [] }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRoles = type === 'Cargos';

  // Cabeçalhos baseados no tipo
  const headers = isRoles
    ? ['nome', 'descricao']
    : ['nome', 'cbo', 'descricao'];

  const downloadTemplate = () => {
    // Usando Ponto e Vírgula (;) para melhor compatibilidade
    let csvContent = headers.join(";") + "\n";

    if (currentItems.length > 0) {
      csvContent += currentItems.map(item => {
        if (isRoles) {
          return `"${item.name}";"${item.description || ''}"`;
        } else {
          return `"${item.name}";"${item.cbo || ''}";"${item.description || ''}"`;
        }
      }).join("\n");
    } else {
      csvContent += (isRoles
        ? "Exemplo Cargo;Descricao Exemplo"
        : "Exemplo Funcao;0000-00;Descricao Exemplo") + "\n";
    }

    // Create Blob with BOM for Excel UTF-8 support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dados_${type.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
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
        const dataRows = rows.slice(1);

        const parsedData = dataRows.map((row, index) => {
          // Detect separator
          const separator = row.includes(';') ? ';' : ',';

          // Split by separator, handling potential quotes if simple
          // For now, simple split + cleanup quotes
          const values = row.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));

          const item: any = {
            id: `bulk-${Math.random().toString(36).substr(2, 9)}`,
            registration: (existingCount + index + 1).toString(),
            name: values[0] || '',
          };

          if (isRoles) {
            item.description = values[1] || '';
            item.functionId = '';
          } else {
            item.cbo = values[1] || '';
            item.description = values[2] || '';
          }
          return item;
        }).filter(i => i.name);

        // Check duplicates by NAME
        const duplicates = parsedData.filter(d => currentItems.some(c => c.name.toLowerCase() === d.name.toLowerCase()));
        setDuplicateCount(duplicates.length);
        setImportedCount(parsedData.length - duplicates.length);

        setPreviewData(parsedData);
        setIsProcessing(false);
      } catch (err) {
        setError("Erro ao processar arquivo. Verifique a formatação.");
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const newItems = previewData.filter(d => !currentItems.some(c => c.name.toLowerCase() === d.name.toLowerCase()));
    if (newItems.length > 0) {
      onImport(newItems);
    }
    if (duplicateCount > 0) {
      alert(`${duplicateCount} registros ignorados pois já existem.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">
        <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-950">Importar {type}</h2>
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Carga de dados em massa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <h4 className="font-black text-emerald-950 text-xs uppercase tracking-tight">1. Baixe o Modelo / Dados Atuais</h4>
            <p className="text-[10px] text-emerald-600/70 font-medium">Você pode baixar os dados já cadastrados para editar ou usar como modelo.</p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-emerald-600 bg-white border border-emerald-200 px-4 py-2 rounded-lg font-black text-[10px] hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-wider"
            >
              <Download size={14} /> {currentItems.length > 0 ? "Exportar Dados Atuais" : "Baixar Modelo .CSV"}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-emerald-950 text-xs uppercase tracking-tight">2. Selecione o Arquivo</h4>
            <p className="text-[10px] text-emerald-500 font-medium">Duplicatas de nome serão ignoradas.</p>
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-200 bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
              >
                <Upload size={32} className="text-emerald-300 mb-3" />
                <p className="text-emerald-900 font-black text-xs uppercase">Carregar arquivo .CSV</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
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
                  <button onClick={() => { setFile(null); setPreviewData([]); setDuplicateCount(0); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><X size={16} /></button>
                </div>
                {duplicateCount > 0 && (
                  <div className="bg-amber-100 text-amber-700 p-3 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {duplicateCount} duplicatas ignoradas
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-in shake duration-500">
              <AlertCircle size={16} />
              <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-emerald-50/50 border-t border-emerald-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 font-black text-[10px] text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all">Cancelar</button>
          <button
            disabled={!file || importedCount === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

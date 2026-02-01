
import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info, Plus } from 'lucide-react';

interface BulkImportSimpleModalProps {
  onClose: () => void;
  onImport: (data: any[]) => void;
  type: 'Cargos' | 'Funções';
  existingCount: number;
}

export const BulkImportSimpleModal: React.FC<BulkImportSimpleModalProps> = ({ onClose, onImport, type, existingCount }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRoles = type === 'Cargos';

  // Cabeçalhos baseados no tipo
  const headers = isRoles 
    ? ['nome', 'descricao'] 
    : ['nome', 'cbo', 'descricao'];

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
      (isRoles 
        ? "Analista de EHS Senior,Responsavel por auditorias e conformidade tecnica" 
        : "Tecnico em Seguranca,2149-15,Atividades de inspecao e treinamento de campo");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `modelo_importacao_${type.toLowerCase()}.csv`);
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
          const values = row.split(',').map(v => v.trim());
          const item: any = {
            id: `bulk-${Math.random().toString(36).substr(2, 9)}`,
            registration: (existingCount + index + 1).toString(),
            name: values[0] || '',
          };

          if (isRoles) {
            item.description = values[1] || '';
            item.functionId = ''; // Vinculação manual posterior ou padrão
          } else {
            item.cbo = values[1] || '';
            item.description = values[2] || '';
          }
          return item;
        });

        setPreviewData(parsedData);
        setIsProcessing(false);
      } catch (err) {
        setError("Erro ao processar arquivo. Verifique a formatação.");
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">
        <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-950">Importar {type}</h2>
              <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Carga de dados em massa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3">
            <h4 className="font-black text-emerald-950 text-sm uppercase tracking-tight">1. Baixe o Modelo</h4>
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl font-black text-[10px] hover:bg-emerald-100 transition-all border border-emerald-100 uppercase tracking-widest"
            >
              <Download size={14} /> Download CSV Modelo
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-emerald-950 text-sm uppercase tracking-tight">2. Selecione o Arquivo</h4>
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
              <div className="bg-emerald-600 p-5 rounded-2xl text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <span className="font-black text-xs truncate max-w-[150px]">{file.name}</span>
                </div>
                <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded">{previewData.length} ITENS</span>
                <button onClick={() => { setFile(null); setPreviewData([]); }} className="p-1 hover:bg-white/10 rounded"><X size={16} /></button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <AlertCircle size={18} />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-emerald-50/50 border-t border-emerald-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 font-black text-[10px] text-emerald-600 uppercase tracking-widest">Cancelar</button>
          <button 
            disabled={!file || previewData.length === 0 || isProcessing}
            onClick={() => { onImport(previewData); onClose(); }}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
};

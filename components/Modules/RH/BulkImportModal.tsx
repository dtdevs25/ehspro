
import { X, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info, Plus } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Collaborator } from '../../../types';

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (data: Collaborator[]) => void;
  existingRegistrationCount: number;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onImport, existingRegistrationCount }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cabeçalhos para o modelo CSV
  const headers = [
    'nome', 'cpf', 'rg', 'data_nascimento', 'cidade_nascimento', 'estado_nascimento', 
    'nome_mae', 'nome_pai', 'escolaridade', 'estado_civil', 'genero', 'raca', 
    'endereco', 'telefone', 'email', 'data_admissao', 'id_cargo', 'id_funcao', 
    'id_empresa', 'id_unidade', 'regime_trabalho', 'codigo_esocial'
  ];

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
      "Exemplo Nome,000.000.000-00,00.000.000-0,1990-01-01,Sao Paulo,SP,Mae Exemplo,Pai Exemplo,Superior Completo,Solteiro(a),Masculino,Parda,Rua Exemplo 123,11999998888,exemplo@email.com,2023-01-01,1,1,c1,b1,EFFECTIVE,S-2200-001";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_colaboradores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
          const values = row.split(',').map(v => v.trim());
          // Mapeamento simples baseado na ordem dos headers
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
        });

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
    onImport(previewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">
        <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-950">Importação em Massa</h2>
              <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Alimente o sistema com múltiplos prontuários</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Passo 1: Download */}
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0">1</div>
            <div className="space-y-3">
              <h4 className="font-black text-emerald-950 uppercase tracking-tight">Baixe a Planilha Modelo</h4>
              <p className="text-sm text-emerald-600/70 font-medium">Use nosso arquivo padronizado para garantir que todos os dados sejam lidos corretamente pelo motor de inteligência EHS PRO.</p>
              <button 
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-emerald-600 bg-white border border-emerald-200 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-emerald-50 transition-all shadow-sm"
              >
                <Download size={16} /> BAIXAR MODELO .CSV
              </button>
            </div>
          </div>

          {/* Passo 2: Upload */}
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0">2</div>
            <div className="space-y-4 flex-1">
              <h4 className="font-black text-emerald-950 uppercase tracking-tight">Envie seu Arquivo Preenchido</h4>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
                >
                  <Upload size={40} className="text-emerald-300 group-hover:text-emerald-500 transition-colors mb-4" />
                  <p className="text-emerald-900 font-black text-sm uppercase tracking-tighter">Clique ou arraste o arquivo aqui</p>
                  <p className="text-emerald-400 text-xs font-bold mt-1">Suporta apenas arquivos .CSV</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                  />
                </div>
              ) : (
                <div className="bg-emerald-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-emerald-200 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="font-black text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                        {isProcessing ? 'Processando dados...' : `${previewData.length} registros detectados`}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setPreviewData([]); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in shake duration-500">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600/50">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Matrículas geradas automaticamente a partir de {existingRegistrationCount + 1}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-3.5 font-black text-xs text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-2xl transition-all">Cancelar</button>
            <button 
              disabled={!file || previewData.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="bg-emerald-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Confirmar Importação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

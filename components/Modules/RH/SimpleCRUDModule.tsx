
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, X, Save, Archive, Sparkles, Hash, FileText, Info, LayoutGrid, List, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { generateRoleDescription } from '../../../services/geminiService';
import { JobFunction, Role } from '../../../types';
import { BulkImportSimpleModal } from './BulkImportSimpleModal';

interface SimpleCRUDModuleProps {
  title: string;
  items: any[];
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  icon: any;
  availableFunctions?: JobFunction[];
}

export const SimpleCRUDModule: React.FC<SimpleCRUDModuleProps> = ({ title, items, onSave, onDelete, icon: Icon, availableFunctions = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ name: '', description: '', cbo: '', functionId: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const isRoles = title === 'Cargos';
  const isFunctions = title === 'Funções';

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      const nextReg = items.length > 0
        ? (Math.max(...items.map(i => parseInt(i.registration) || 0)) + 1).toString()
        : "1";
      setEditingItem(null);
      setFormData({ registration: nextReg, name: '', description: '', cbo: '', functionId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleAiDescribe = async () => {
    if (!formData.name) return alert("Insira o nome primeiro.");
    let cbo = isRoles ? availableFunctions.find(f => f.id === formData.functionId)?.cbo : formData.cbo;
    if (!cbo) return alert("CBO obrigatório para IA.");
    setIsAiLoading(true);
    const desc = await generateRoleDescription(formData.name, cbo);
    setFormData({ ...formData, description: desc });
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...editingItem, ...formData });
    handleCloseModal();
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(item => {
      onSave(item);
    });
    setIsBulkImportOpen(false);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Gestão de {title}</h1>
          <p className="text-emerald-600/70 text-sm font-medium">Controle de registros e descrições técnicas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 text-xs uppercase tracking-widest"
          >
            <FileSpreadsheet size={16} /> Importar
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-emerald-100 overflow-hidden shadow-xl shadow-emerald-200/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50/20 text-left text-[9px] text-emerald-400 font-black uppercase tracking-widest border-b border-emerald-50">
              <tr>
                <th className="px-6 py-4 w-20">Reg.</th>
                <th className="px-6 py-4">Nome</th>
                {isFunctions && <th className="px-6 py-4">CBO</th>}
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50/50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4 font-black text-emerald-600 text-xs">{item.registration}</td>
                  <td className="px-6 py-4 font-black text-emerald-950 text-xs">{item.name}</td>
                  {isFunctions && <td className="px-6 py-4 font-medium text-emerald-700 text-xs">{item.cbo}</td>}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleOpenModal(item)} className="p-1.5 text-emerald-400 hover:bg-emerald-50 rounded-lg"><Edit3 size={16} /></button>
                      <button onClick={() => setItemToDelete(item)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-white/20">
            <div className="p-6 border-b border-emerald-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-emerald-950">{editingItem ? 'Editar' : 'Novo'} {title.slice(0, -1)}</h2>
              <button onClick={handleCloseModal} className="p-1.5 text-emerald-400 hover:bg-emerald-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Nome / Título</label>
                <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-sm" />
              </div>
              {isFunctions && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Código CBO</label>
                  <input
                    required
                    value={formData.cbo || ''}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 6) v = v.slice(0, 6);
                      if (v.length > 4) v = v.replace(/^(\d{4})(\d)/, '$1-$2');
                      setFormData({ ...formData, cbo: v });
                    }}
                    placeholder="0000-00"
                    maxLength={7}
                    className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-sm"
                  />
                </div>
              )}
              {isRoles && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Função Vinculada</label>
                  <select required value={formData.functionId || ''} onChange={e => setFormData({ ...formData, functionId: e.target.value })} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-bold text-sm">
                    <option value="">Selecione...</option>
                    {availableFunctions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-emerald-800/60 uppercase tracking-widest ml-1">Descrição</label>
                  <button type="button" onClick={handleAiDescribe} disabled={isAiLoading} className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black border border-emerald-200">IA DESCERVE</button>
                </div>
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl font-medium text-xs min-h-[120px]" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-black text-[10px] text-emerald-600 uppercase">Cancelar</button>
                <button type="submit" className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkImportOpen && (
        <BulkImportSimpleModal
          type={title as any}
          onClose={() => setIsBulkImportOpen(false)}
          onImport={handleBulkImport}
          existingCount={items.length}
        />
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm" onClick={() => setItemToDelete(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center space-y-4 relative z-10 border border-red-50">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-2"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-red-950">Excluir Permanente?</h3>
            <p className="text-xs text-red-900/60 font-medium">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 font-black text-[10px] text-red-600 uppercase tracking-widest">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

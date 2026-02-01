
import React, { useState } from 'react';
import { Plus, Building2, MapPin, Search, Trash2, Edit3, LayoutGrid, List, X, Archive, Hash, AlertTriangle } from 'lucide-react';
import { Company, Branch } from '../../../types';

interface RegistrationModuleProps {
  type: 'companies' | 'branches';
  companies: Company[];
  branches: Branch[];
  onSaveCompany: (c: Partial<Company>) => void;
  onSaveBranch: (b: Partial<Branch>) => void;
  onDeleteCompany: (id: string) => void;
  onDeleteBranch: (id: string) => void;
}

export const RegistrationModule: React.FC<RegistrationModuleProps> = ({ 
  type, companies, branches, onSaveCompany, onSaveBranch, onDeleteCompany, onDeleteBranch 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  const isCompany = type === 'companies';

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', cnpj: '', cnae: '', address: '', companyId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompany) {
      onSaveCompany(formData);
    } else {
      onSaveBranch(formData);
    }
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (isCompany) {
        onDeleteCompany(itemToDelete.id);
      } else {
        onDeleteBranch(itemToDelete.id);
      }
      setItemToDelete(null);
    }
  };

  const list = isCompany ? companies : branches;
  const filteredList = list
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.cnpj.includes(searchQuery) ||
      item.cnae?.includes(searchQuery)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative text-emerald-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{isCompany ? 'Gestão de Empresas' : 'Gestão de Filiais'}</h1>
          <p className="text-emerald-600/70 font-medium">Controle centralizado das entidades corporativas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-emerald-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:bg-emerald-50'}`}
              title="Visualização em Cards"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:bg-emerald-50'}`}
              title="Visualização em Lista"
            >
              <List size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-xl shadow-emerald-200 active:scale-95"
          >
            <Plus size={20} /> {isCompany ? 'Nova Empresa' : 'Nova Filial'}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={20} />
        <input 
          type="text" 
          placeholder={`Buscar por nome, CNPJ ou CNAE...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-emerald-100 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all shadow-sm font-medium text-emerald-900"
        />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filteredList.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 group hover:border-emerald-300 transition-all relative">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                {isCompany ? <Building2 size={24} /> : <MapPin size={24} />}
              </div>
              <h3 className="font-black text-emerald-950 text-lg mb-1 truncate pr-16">{item.name}</h3>
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">CNPJ: {item.cnpj}</span>
                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">CNAE: {item.cnae || 'NÃO INFORMADO'}</span>
              </div>
              <div className="text-sm text-emerald-600/70 font-medium flex items-start gap-2 h-10 overflow-hidden line-clamp-2">
                <MapPin size={14} className="mt-1 flex-shrink-0" />
                {item.address}
              </div>
              {!isCompany && (
                <div className="mt-4 pt-4 border-t border-emerald-50">
                   <p className="text-[10px] font-black text-emerald-300 uppercase truncate">Matriz: {companies.find(c => c.id === (item as Branch).companyId)?.name}</p>
                </div>
              )}
              <div className="absolute top-6 right-6 flex items-center gap-1">
                <button 
                  onClick={() => handleOpenModal(item)}
                  className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                  title="Editar"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => setItemToDelete(item)}
                  className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden shadow-2xl shadow-emerald-200/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50/50 text-left text-xs text-emerald-400 font-black uppercase tracking-widest border-b border-emerald-100">
                  <th className="px-8 py-6">{isCompany ? 'Empresa' : 'Filial'}</th>
                  <th className="px-8 py-6">Documentação</th>
                  {!isCompany && <th className="px-8 py-6">Matriz</th>}
                  <th className="px-8 py-6">Localização</th>
                  <th className="px-8 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          {isCompany ? <Building2 size={20} /> : <MapPin size={20} />}
                        </div>
                        <span className="font-black text-emerald-950">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-emerald-400">{item.cnpj}</span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase">CNAE: {item.cnae || 'PENDENTE'}</span>
                       </div>
                    </td>
                    {!isCompany && (
                      <td className="px-8 py-5 text-xs font-medium text-emerald-600">
                        {companies.find(c => c.id === (item as Branch).companyId)?.name}
                      </td>
                    )}
                    <td className="px-8 py-5 text-sm text-emerald-600 font-medium truncate max-w-xs">{item.address}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal}></div>
          
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-500 border border-white/20">
            <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  {isCompany ? <Building2 size={28} /> : <MapPin size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-emerald-950">
                    {editingItem ? `Editar ${isCompany ? 'Empresa' : 'Filial'}` : `Nova ${isCompany ? 'Empresa' : 'Filial'}`}
                  </h2>
                  <p className="text-sm font-medium text-emerald-600/70">Preencha as informações cadastrais abaixo.</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-3 text-emerald-400 hover:bg-emerald-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isCompany && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Empresa Matriz</label>
                    <select 
                      required
                      value={formData.companyId || ''}
                      onChange={e => setFormData({...formData, companyId: e.target.value})}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    >
                      <option value="">Selecione a Empresa Matriz...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Razão Social / Nome</label>
                  <input 
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Ex: EHS Solutions LTDA"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">CNPJ</label>
                  <input 
                    required
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj || ''}
                    onChange={e => setFormData({...formData, cnpj: e.target.value})}
                    className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1 flex justify-between">
                    CNAE Principal <span className="text-[9px] text-red-500 font-black">OBRIGATÓRIO</span>
                  </label>
                  <input 
                    required
                    placeholder="Ex: 70.20-4-00"
                    value={formData.cnae || ''}
                    onChange={e => setFormData({...formData, cnae: e.target.value})}
                    className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl font-black text-emerald-950 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none border-2"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Endereço Completo</label>
                  <input 
                    required
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-emerald-50">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-8 py-3.5 font-bold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                >
                  Descartar
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 text-white px-12 py-3.5 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
                >
                  {editingItem ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirmação de Exclusão Customizado */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setItemToDelete(null)}></div>
          
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center space-y-4 relative z-10 border border-red-50 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500 mb-2 shadow-inner">
                  <AlertTriangle size={40}/>
              </div>
              <h3 className="text-2xl font-black text-red-950">Remover Registro?</h3>
              <p className="text-xs text-red-900/60 font-medium leading-relaxed">
                Você está prestes a excluir <b>{itemToDelete.name}</b>. 
                {isCompany && " Todas as filiais vinculadas também serão removidas."} 
                <br/><strong>Esta ação não poderá ser desfeita.</strong>
              </p>
              <div className="flex gap-2 pt-4">
                  <button 
                    onClick={() => setItemToDelete(null)} 
                    className="flex-1 py-3.5 font-black text-[10px] text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                  >
                    Manter
                  </button>
                  <button 
                    onClick={handleConfirmDelete} 
                    className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all tracking-widest"
                  >
                    Confirmar
                  </button>
              </div>
          </div>
        </div>
      )}

      {filteredList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-emerald-100 shadow-inner">
          <Archive size={64} className="text-emerald-100 mb-4" />
          <h3 className="text-xl font-black text-emerald-950">Nenhum registro encontrado</h3>
          <p className="text-emerald-500 font-medium">Refine sua busca ou cadastre um novo item.</p>
        </div>
      )}
    </div>
  );
};

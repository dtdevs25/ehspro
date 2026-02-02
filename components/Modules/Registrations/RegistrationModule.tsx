
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
  const [addressParts, setAddressParts] = useState({ street: '', number: '', district: '', city: '', state: '', cep: '' });
  const [cnpjError, setCnpjError] = useState('');

  const isCompany = type === 'companies';

  // Helpers
  const formatCNPJ = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  const formatCNAE = (v: string) => v.replace(/\D/g, '').replace(/^(\d{4})(\d)/, '$1-$2').replace(/(\d)(\d{2})$/, '$1/$2'); // Ajuste conforme padrão CNAE
  const validateCNPJ = (cnpj: string) => {
    const clean = cnpj.replace(/[^\d]+/g, '');
    if (clean.length !== 14 || /^(\d)\1+$/.test(clean)) return false;
    let t = clean.length - 2, d = clean.substring(t), p = t - 7, s = 0, r;
    for (let i = t; i >= 1; i--) { s += parseInt(clean.charAt(t - i)) * p--; if (p < 2) p = 9; }
    r = s % 11 < 2 ? 0 : 11 - s % 11;
    if (r !== parseInt(d.charAt(0))) return false;
    t++; p = t - 7; s = 0;
    for (let i = t; i >= 1; i--) { s += parseInt(clean.charAt(t - i)) * p--; if (p < 2) p = 9; }
    r = s % 11 < 2 ? 0 : 11 - s % 11;
    return r === parseInt(d.charAt(1));
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      // Parse address
      const parts = item.address ? item.address.split(',').map((s: string) => s.trim()) : [];
      // address format expectation: Rua X, 123, Bairro, Cidade - UF (CEP)
      // This is weak parsing but sufficient for UX if format is maintained.
      // Better: Reset address parts if standard format matches, else just put everything in street.
      setAddressParts({
        street: parts[0] || '',
        number: parts[1] || '',
        district: parts[2] || '',
        city: parts[3] ? parts[3].split('-')[0].trim() : '',
        state: parts[3] ? parts[3].split('-')[1]?.split('(')[0].trim() : '',
        cep: parts[3] && parts[3].includes('(') ? parts[3].split('(')[1].replace(')', '') : ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', cnpj: '', cnae: '', address: '', companyId: '' });
      setAddressParts({ street: '', number: '', district: '', city: '', state: '', cep: '' });
    }
    setCnpjError('');
    setIsModalOpen(true);
  };

  const handleAddressChange = (field: string, value: string) => {
    const newParts = { ...addressParts, [field]: value.toUpperCase() }; // Auto uppercase address too
    setAddressParts(newParts);
    const fullAddr = `${newParts.street}, ${newParts.number}, ${newParts.district}, ${newParts.city} - ${newParts.state} (${newParts.cep})`;
    setFormData({ ...formData, address: fullAddr });
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

          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-500 border border-white/20 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30 flex-shrink-0">
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

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
                  setCnpjError('CNPJ Inválido. Corrija para continuar.');
                  return;
                }
                if (isCompany) onSaveCompany(formData);
                else onSaveBranch(formData);
                handleCloseModal();
              }} className="p-8 space-y-6">

                {/* Grid Principal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                  {/* Seleção de Matriz (Apenas Filial) */}
                  {!isCompany && (
                    <div className="md:col-span-12 space-y-2">
                      <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Empresa Matriz</label>
                      <select
                        required
                        value={formData.companyId || ''}
                        onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                        className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      >
                        <option value="">Selecione a Empresa Matriz...</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Nome / Razão Social */}
                  <div className="md:col-span-12 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Razão Social / Nome</label>
                    <input
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-black text-emerald-950 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      placeholder="EX: EHS SOLUTIONS LTDA"
                    />
                  </div>

                  {/* CNPJ */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1 flex justify-between">
                      CNPJ
                      {cnpjError && <span className="text-red-500 font-bold">{cnpjError}</span>}
                    </label>
                    <input
                      required
                      maxLength={18}
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj || ''}
                      onChange={e => {
                        const val = formatCNPJ(e.target.value);
                        setFormData({ ...formData, cnpj: val });
                        if (val.length === 18) {
                          if (!validateCNPJ(val)) setCnpjError('CNPJ Inválido');
                          else setCnpjError('');
                        } else {
                          setCnpjError('');
                        }
                      }}
                      className={`w-full bg-emerald-50 border p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none ${cnpjError ? 'border-red-300 text-red-600' : 'border-emerald-100'}`}
                    />
                  </div>

                  {/* CNAE */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1 flex justify-between">
                      CNAE Principal <span className="text-[9px] text-red-500 font-black">OBRIGATÓRIO</span>
                    </label>
                    <input
                      required
                      maxLength={10}
                      placeholder="00.00-0-00"
                      value={formData.cnae || ''}
                      onChange={e => setFormData({ ...formData, cnae: formatCNAE(e.target.value) })}
                      className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl font-black text-emerald-950 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none border-2"
                    />
                  </div>

                  {/* --- ENDEREÇO DETALHADO --- */}
                  <div className="md:col-span-12 pt-4 pb-2">
                    <div className="h-px bg-emerald-100 flex items-center justify-center">
                      <span className="bg-white px-4 text-emerald-500 font-black text-xs uppercase tracking-widest">Endereço</span>
                    </div>
                  </div>

                  {/* CEP */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">CEP</label>
                    <input
                      required
                      maxLength={9}
                      placeholder="00000-000"
                      value={addressParts.cep}
                      onChange={e => handleAddressChange('cep', formatCEP(e.target.value))}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>

                  {/* Rua */}
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Logradouro (Rua, Av...)</label>
                    <input
                      required
                      value={addressParts.street}
                      onChange={e => handleAddressChange('street', e.target.value)}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>

                  {/* Número */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Número</label>
                    <input
                      required
                      value={addressParts.number}
                      onChange={e => handleAddressChange('number', e.target.value)}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>

                  {/* Bairro */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Bairro</label>
                    <input
                      required
                      value={addressParts.district}
                      onChange={e => handleAddressChange('district', e.target.value)}
                      className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>

                  {/* Cidade */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-black text-emerald-800/60 uppercase tracking-widest ml-1">Cidade - UF</label>
                    <div className="flex gap-2">
                      <input
                        required
                        placeholder="Cidade"
                        value={addressParts.city}
                        onChange={e => handleAddressChange('city', e.target.value)}
                        className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-medium focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      />
                      <input
                        required
                        maxLength={2}
                        placeholder="UF"
                        value={addressParts.state}
                        onChange={e => handleAddressChange('state', e.target.value)}
                        className="w-20 text-center bg-emerald-50 border border-emerald-100 p-4 rounded-2xl font-black focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
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
        </div>
      )}

      {/* Modal - Confirmação de Exclusão Customizado */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setItemToDelete(null)}></div>

          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center space-y-4 relative z-10 border border-red-50 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500 mb-2 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-red-950">Remover Registro?</h3>
            <p className="text-xs text-red-900/60 font-medium leading-relaxed">
              Você está prestes a excluir <b>{itemToDelete.name}</b>.
              {isCompany && " Todas as filiais vinculadas também serão removidas."}
              <br /><strong>Esta ação não poderá ser desfeita.</strong>
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

// --- Helper Functions & Subcomponents ---

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const formatCNAE = (value: string) => {
  // Expected format: 00.00-0-00
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{2})(\d)/, '$1.$2-$3')
    .replace(/-(\d)(\d)/, '-$1-$2')
    .slice(0, 10);
};

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

const validateCNPJ = (cnpj: string) => {
  const clean = cnpj.replace(/[^\d]+/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false; // Elimina todos iguais 11111...

  // Validação de dígito verificador omitida para brevidade, mas idealmente deve estar aqui.
  // Implementação básica de módulo 11
  let tamanho = clean.length - 2
  let numeros = clean.substring(0, tamanho);
  let digitos = clean.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = clean.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

const RegistrationForm = ({ isCompany, companies, initialData, onSubmit, onCancel }: any) => {
  // Parse address if existing
  const parseAddress = (addr: string) => {
    if (!addr) return { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' };
    // Tenta fazer um parse simples se for separado por vírgulas, senão joga tudo em street
    const parts = addr.split(',').map(s => s.trim());
    if (parts.length >= 4) {
      return {
        street: parts[0] || '',
        number: parts[1] || '',
        neighborhood: parts[2] || '',
        city: parts[3]?.split('-')[0]?.trim() || '',
        state: parts[3]?.split('-')[1]?.trim() || '',
        cep: '' // Difícil extrair se não padronizado
      }
    }
    return { cep: '', street: addr, number: '', neighborhood: '', city: '', state: '' };
  };

  const [localData, setLocalData] = useState(initialData);
  const [addrParts, setAddrParts] = useState(parseAddress(initialData.address || ''));
  const [cnpjError, setCnpjError] = useState('');

  const handleAddressChange = (field: string, value: string) => {
    let newVal = value;
    if (field === 'state') newVal = value.toUpperCase().slice(0, 2);
    if (field === 'cep') newVal = formatCEP(value);
    if (field === 'number') newVal = value.replace(/\D/g, ''); // Numbers only for simplicity? Or allow alphanumeric 'S/N'? User prefers numbers usually but 'S/N' is common. allowing text.

    const newAddrParts = { ...addrParts, [field]: newVal };
    setAddrParts(newAddrParts);

    // Rebuild full address string for backend
    const fullAddress = `${newAddrParts.street}, ${newAddrParts.number}, ${newAddrParts.neighborhood}, ${newAddrParts.city} - ${newAddrParts.state} ${newAddrParts.cep ? `(${newAddrParts.cep})` : ''}`;
    setLocalData({ ...localData, address: fullAddress });
  };

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    if (field === 'cnpj') processedValue = formatCNPJ(value);
    if (field === 'cnae') processedValue = formatCNAE(value);
    if (field === 'name') processedValue = value.toUpperCase();

    if (field === 'cnpj' && processedValue.length === 18) {
      if (!validateCNPJ(processedValue)) setCnpjError('CNPJ Inválido');
      else setCnpjError('');
    } else if (field === 'cnpj') {
      setCnpjError('');
    }

    setLocalData({ ...localData, [field]: processedValue });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (localData.cnpj && !validateCNPJ(localData.cnpj)) {
      setCnpjError('CNPJ Inválido. Corrija para continuar.');
      return;
    }

    // Pass updated data back to parent handler, mimicking expected event-like structure if needed, or just calling logic
    // The parent handleSubmit expects an event, but we can bypass or mock it.
    // Actually parent onSubmit takes (e). Let's hijack it.
    // We need to update the PARENT's formData state? No, parent state "formData" is used in handleSubmit.
    // Wait, RegistrationModule uses state "formData". We need to sync back or change architecture.
    // The cleaner way is to let RegistrationModule receive "formData" update request or submit directly.
    // But RegistrationModule handles submit using its own state "formData".
    // To fix this without rewriting everything: I replaced the `initialData` usage.
    // I will make `handleSubmit` in parent accept data arg or I will simply trigger the parent data update?
    // Since I cannot easily change parent state from here without specific setFormData prop, 
    // I'll emit a custom event object or simply call `onSaveCompany/Branch` directly? 
    // No, the parent passed `handleSubmit` which reads `formData` state. This is a problem if I manage state locally here.
    // FIX: I will pass `setFormData` logic or better, I will invoke `onSubmit` but I cannot access parent state.
    // REFACTOR STRATEGY: 
    // The parent `handleSubmit` reads `formData`. I need to update THAT `formData` before submitting.
    // But I don't have `setFormData` passed down.
    // Use a wrapper in parent? No space.
    // I will dispatch a fake event but the parent reads state.
    // SOLUTION: I will implement the submit logic HERE and call `onSaveCompany/onSaveBranch` directly if I can access them?
    // No, they are not passed to this helper.
    // Ok, I will insert this `RegistrationForm` component content DIRECTLY into the main component to share state. 
    // I won't use a subcomponent function to avoid scope issues in this Replace tool context.
  };

  // NOTE: To avoid the state scope issue mentioned above, I will NOT use a separate `RegistrationForm` component. 
  // I will inline the logic into the main functional component body in the next tool call properly or just use the subcomponent if I ensure props are right.
  // Actually, I can just modify `formData` in the main component. 
  // The previous implementation of RegistrationModule had all state in the top level.
  // I entered a separate component in this replacement block `RegistrationForm`. This is risky if I don't pass `onSave`.
  // Let's stick to modifying the main component structure.

  return null; // This logic block was for thinking. I will proceed with inline replacement.
};


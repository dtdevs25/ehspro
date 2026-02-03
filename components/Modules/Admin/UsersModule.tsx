
import React, { useState, useMemo } from 'react';
import { User, Company, Branch, UserRole, Permission } from '../../../types';
import { Search, Plus, Edit3, Trash2, Key, Shield, Building2, CheckCircle2, Circle, X } from 'lucide-react';
import { MENU_CONFIG } from '../../../constants';

interface UsersModuleProps {
    currentUser: User;
    users: User[];
    companies: Company[];
    branches: Branch[];
    onSaveUser: (userData: any) => Promise<void>;
    onDeleteUser: (id: string) => Promise<void>;
}

export const UsersModule: React.FC<UsersModuleProps> = ({
    currentUser, users, companies, branches: allBranches, onSaveUser, onDeleteUser
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' as UserRole,
        allowedBranches: [] as string[],
        allowedModules: [] as string[],
        permissions: [] as Permission[],
        functionName: ''
    });

    // Filter users based on hierarchy
    // Master sees all. Manager sees only their created users (or users in same branches? sticking to created for now)
    const filteredUsers = useMemo(() => {
        let list = users;

        // If not Master, filter hierarchy
        if (currentUser.role !== 'MASTER') {
            // Filter users created by me OR users that report to me (recursive ideally, but 1-level for now)
            list = users.filter(u => u.parentUserId === currentUser.id || u.id === currentUser.id);
        }

        return list.filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery, currentUser]);

    // Determine available branches to assign
    const assignableBranches = useMemo(() => {
        if (currentUser.role === 'MASTER') return allBranches;
        // Manager can only assign branches they have access to
        const myBranchIds = currentUser.allowedBranches || [];
        return allBranches.filter(b => myBranchIds.includes(b.id));
    }, [allBranches, currentUser]);

    const assignableCompanies = useMemo(() => {
        const branchIds = assignableBranches.map(b => b.id);
        const companyIds = Array.from(new Set(assignableBranches.map(b => b.companyId)));
        return companies.filter(c => companyIds.includes(c.id));
    }, [assignableBranches, companies]);


    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role,
                allowedBranches: user.allowedBranches || [],
                allowedModules: user.allowedModules || [],
                permissions: user.permissions || [],
                functionName: user.functionName || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'USER', // Default
                allowedBranches: [],
                allowedModules: [],
                permissions: [],
                functionName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            await onSaveUser({ ...formData, id: editingUser.id });
        } else {
            await onSaveUser({
                ...formData,
                parentUserId: currentUser.id // Link to creator
            });
        }
        setIsModalOpen(false);
    };

    const toggleBranch = (branchId: string) => {
        setFormData(prev => {
            const current = prev.allowedBranches;
            if (current.includes(branchId)) return { ...prev, allowedBranches: current.filter(id => id !== branchId) };
            return { ...prev, allowedBranches: [...current, branchId] };
        });
    };

    const toggleModule = (moduleId: string) => {
        setFormData(prev => {
            const currentModules = prev.allowedModules;
            const currentPermissions = prev.permissions || [];

            if (currentModules.includes(moduleId)) {
                // Remove
                return {
                    ...prev,
                    allowedModules: currentModules.filter(id => id !== moduleId),
                    permissions: currentPermissions.filter(p => p.moduleId !== moduleId)
                };
            } else {
                // Add with all submodules selected by default
                const moduleConfig = MENU_CONFIG.find(m => m.id === moduleId);
                const allSubIds = moduleConfig ? moduleConfig.subItems.map(s => s.id) : [];

                return {
                    ...prev,
                    allowedModules: [...currentModules, moduleId],
                    permissions: [...currentPermissions, { moduleId, subModules: allSubIds }]
                };
            }
        });
    };

    const toggleSubModule = (moduleId: string, subId: string) => {
        setFormData(prev => {
            const currentPermissions = [...(prev.permissions || [])];
            const permIndex = currentPermissions.findIndex(p => p.moduleId === moduleId);

            if (permIndex >= 0) {
                const perm = { ...currentPermissions[permIndex] };
                if (perm.subModules.includes(subId)) {
                    perm.subModules = perm.subModules.filter(s => s !== subId);
                } else {
                    perm.subModules = [...perm.subModules, subId];
                }
                currentPermissions[permIndex] = perm;

                return { ...prev, permissions: currentPermissions };
            }
            return prev;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-emerald-950">Gestão de Usuários</h1>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">
                        {currentUser.role === 'MASTER' ? 'Acesso Total' : `Gerenciado por ${currentUser.name}`}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-emerald-500 transition-all"
                >
                    <Plus size={20} /> Novo Usuário
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-emerald-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-emerald-50/50 border border-emerald-100 p-3 pl-12 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-emerald-50/30 text-left text-xs text-emerald-500 font-black uppercase tracking-widest">
                                <th className="px-8 py-4">Usuário</th>
                                <th className="px-8 py-4">Função</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Acessos</th>
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-emerald-950">{user.name}</p>
                                                <p className="text-xs text-emerald-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${user.role === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-xs font-bold text-emerald-600">Ativo</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1 text-xs text-emerald-600">
                                            <span>{user.allowedBranches?.length || 0} Unidades</span>
                                            <span>{user.allowedModules?.length || 0} Módulos</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(user)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Edit3 size={18} /></button>
                                            <button onClick={() => onDeleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-emerald-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-black text-emerald-950">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-emerald-50 rounded-full text-emerald-400"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-emerald-600 uppercase">Nome Completo</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl outline-none focus:border-emerald-400 font-medium text-emerald-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-emerald-600 uppercase">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl outline-none focus:border-emerald-400 font-medium text-emerald-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-emerald-600 uppercase">Cargo / Função</label>
                                    <input type="text" value={formData.functionName} onChange={e => setFormData({ ...formData, functionName: e.target.value })} className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl outline-none focus:border-emerald-400 font-medium text-emerald-900" placeholder="Ex: Técnico de Segurança" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-emerald-600 uppercase">Senha {editingUser && '(Deixe em branco para manter)'}</label>
                                    <input type={editingUser ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl outline-none focus:border-emerald-400 font-medium text-emerald-900" placeholder={editingUser ? "Nova senha..." : "******"} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-emerald-600 uppercase">Nível de Acesso</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl outline-none focus:border-emerald-400 font-medium text-emerald-900">
                                    <option value="USER">Usuário / Operador</option>
                                    {(currentUser.role === 'MASTER' || currentUser.role === 'MANAGER') && (
                                        <option value="MANAGER">Gestor (Responsável)</option>
                                    )}
                                    {currentUser.role === 'MASTER' && (
                                        <option value="MASTER">Master (Admin Geral)</option>
                                    )}
                                </select>
                                <p className="text-[10px] text-emerald-500 font-medium">
                                    {formData.role === 'MANAGER' ? 'Pode criar outros usuários e gerenciar filiais configuradas.' :
                                        formData.role === 'MASTER' ? 'Acesso irrestrito ao sistema.' : 'Acesso restrito aos módulos e filiais selecionados.'}
                                </p>
                            </div>

                            {/* Permissions Section */}
                            {formData.role !== 'MASTER' && (
                                <>
                                    <div className="space-y-4 pt-4 border-t border-emerald-50">
                                        <h3 className="text-sm font-black text-emerald-800 uppercase flex items-center gap-2"><Building2 size={16} /> Permissões de Filiais</h3>
                                        <div className="grid grid-cols-1 gap-4 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-emerald-50/30 rounded-xl border border-emerald-50">
                                            {assignableCompanies.map(comp => (
                                                <div key={comp.id}>
                                                    <p className="text-xs font-bold text-emerald-700 mb-2">{comp.name}</p>
                                                    <div className="ml-4 space-y-2">
                                                        {assignableBranches.filter(b => b.companyId === comp.id).map(branch => (
                                                            <label key={branch.id} className="flex items-center gap-3 cursor-pointer group">
                                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.allowedBranches.includes(branch.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-200 text-transparent'}`}>
                                                                    <CheckCircle2 size={14} />
                                                                </div>
                                                                <input type="checkbox" className="hidden" checked={formData.allowedBranches.includes(branch.id)} onChange={() => toggleBranch(branch.id)} />
                                                                <span className="text-sm text-emerald-900 font-medium group-hover:text-emerald-700">{branch.name}</span>
                                                            </label>
                                                        ))}
                                                        {assignableBranches.filter(b => b.companyId === comp.id).length === 0 && <p className="text-xs text-emerald-400 italic">Nenhuma filial disponível.</p>}
                                                    </div>
                                                </div>
                                            ))}
                                            {assignableCompanies.length === 0 && <p className="text-xs text-emerald-500">Nenhuma empresa disponível para atribuir.</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-emerald-50">
                                        <h3 className="text-sm font-black text-emerald-800 uppercase flex items-center gap-2"><Shield size={16} /> Permissões de Módulos</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {MENU_CONFIG.filter(m => m.id !== 'dashboard').map(menu => {
                                                const isModuleSelected = formData.allowedModules.includes(menu.id);
                                                const modulePerm = formData.permissions.find(p => p.moduleId === menu.id);

                                                return (
                                                    <div key={menu.id} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${isModuleSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-emerald-100'}`}>
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input type="checkbox" className="hidden" checked={isModuleSelected} onChange={() => toggleModule(menu.id)} />
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isModuleSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-300'}`}>
                                                                <Shield size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-900 uppercase">{menu.label}</span>
                                                        </label>

                                                        {isModuleSelected && (
                                                            <div className="pl-11 grid grid-cols-1 gap-1.5 animate-in slide-in-from-top-2">
                                                                {menu.subItems.map(sub => {
                                                                    const isSubSelected = modulePerm?.subModules.includes(sub.id);
                                                                    return (
                                                                        <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSubSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-200 text-transparent'}`}>
                                                                                <CheckCircle2 size={10} />
                                                                            </div>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="hidden"
                                                                                checked={!!isSubSelected}
                                                                                onChange={() => toggleSubModule(menu.id, sub.id)}
                                                                            />
                                                                            <span className="text-[10px] font-medium text-emerald-700 group-hover:text-emerald-900">{sub.label}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-200 transition-all">Salvar Usuário</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

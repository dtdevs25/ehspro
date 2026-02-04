
import React from 'react';
import { X, User, Calendar, MapPin, Briefcase, Mail, Phone, Info } from 'lucide-react';
import { Collaborator, Role, JobFunction, Company, Branch } from '../../../types';

interface CollaboratorDetailsModalProps {
    collaborator: Collaborator;
    onClose: () => void;
    roles: Role[];
    functions: JobFunction[];
    companies: Company[];
    branches: Branch[];
}

export const CollaboratorDetailsModal: React.FC<CollaboratorDetailsModalProps> = ({
    collaborator,
    onClose,
    roles,
    functions,
    companies,
    branches
}) => {
    const roleName = roles.find(r => r.id === collaborator.roleId)?.name || 'N/A';
    const functionName = functions.find(f => f.id === collaborator.functionId)?.name || 'N/A';
    const companyName = companies.find(c => c.id === collaborator.companyId)?.name || 'N/A';
    const branchName = branches.find(b => b.id === collaborator.branchId)?.name || 'N/A';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="bg-white w-full max-w-2xl h-auto max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-white/20">

                <div className="bg-emerald-50/50 p-6 border-b border-emerald-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-emerald-950">{collaborator.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Matrícula: {collaborator.registration}</span>
                                <div className="w-1 h-1 bg-emerald-200 rounded-full" />
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${collaborator.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                    {collaborator.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-emerald-400 hover:bg-emerald-100 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                                <Briefcase size={12} /> Cargo / Função
                            </label>
                            <p className="font-bold text-emerald-950 text-sm">{roleName}</p>
                            <p className="text-xs text-emerald-600">{functionName}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                                <MapPin size={12} /> Local de Trabalho
                            </label>
                            <p className="font-bold text-emerald-950 text-sm">{branchName}</p>
                            <p className="text-xs text-emerald-600">{companyName}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                                <Mail size={12} /> Contato
                            </label>
                            <p className="font-bold text-emerald-950 text-sm">{collaborator.email || '-'}</p>
                            <p className="text-xs text-emerald-600">{collaborator.phone || '-'}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                                <Calendar size={12} /> Datas
                            </label>
                            <p className="font-bold text-emerald-950 text-sm">Admissão: {new Date(collaborator.admissionDate).toLocaleDateString()}</p>
                            {collaborator.birthDate && (
                                <p className="text-xs text-emerald-600">Nascimento: {new Date(collaborator.birthDate).toLocaleDateString()}</p>
                            )}
                        </div>

                        <div className="col-span-full space-y-1 bg-emerald-50/30 p-4 rounded-xl border border-emerald-50">
                            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                                <Info size={12} /> Informações Pessoais
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <div>
                                    <span className="block text-[9px] uppercase text-emerald-600">CPF</span>
                                    <span className="font-bold text-xs text-emerald-900">{collaborator.cpf}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase text-emerald-600">RG</span>
                                    <span className="font-bold text-xs text-emerald-900">{collaborator.rg || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase text-emerald-600">Gênero</span>
                                    <span className="font-bold text-xs text-emerald-900">{collaborator.gender}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase text-emerald-600">Estado Civil</span>
                                    <span className="font-bold text-xs text-emerald-900">{collaborator.maritalStatus}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t border-emerald-50 bg-emerald-50/20 shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

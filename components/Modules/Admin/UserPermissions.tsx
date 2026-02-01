
import React from 'react';
import { User, Shield, CheckCircle2, Circle } from 'lucide-react';
import { MENU_CONFIG } from '../../../constants';
import { User as UserType } from '../../../types';

interface UserPermissionsProps {
  users: UserType[];
  onUpdatePermissions: (userId: string, moduleId: string, subId: string) => void;
}

export const UserPermissions: React.FC<UserPermissionsProps> = ({ users, onUpdatePermissions }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Controle de Acessos</h1>
          <p className="text-slate-500">Gerencie quais módulos e funcionalidades cada usuário pode acessar.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
          Convidar Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
                </div>
              </div>
              {user.role === 'MASTER' && (
                <span className="bg-blue-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black">
                  Acesso Total
                </span>
              )}
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase tracking-tighter border-b">
                    <th className="pb-3 w-48">Módulo</th>
                    <th className="pb-3">Submódulos / Funcionalidades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MENU_CONFIG.map(menu => {
                    const modulePerm = user.permissions.find(p => p.moduleId === menu.id);
                    return (
                      <tr key={menu.id} className="group hover:bg-slate-50/50">
                        <td className="py-4 font-medium text-slate-700 flex items-center gap-2">
                          <Shield size={16} className="text-slate-300" /> {menu.label}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            {menu.subItems.map(sub => {
                              const isGranted = modulePerm?.subModules.includes(sub.id) || user.role === 'MASTER';
                              return (
                                <button
                                  key={sub.id}
                                  disabled={user.role === 'MASTER'}
                                  onClick={() => onUpdatePermissions(user.id, menu.id, sub.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border ${
                                    isGranted 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                                  } ${user.role !== 'MASTER' ? 'hover:scale-105 active:scale-95' : ''}`}
                                >
                                  {isGranted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

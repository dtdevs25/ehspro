
import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Lock,
  ChevronDown,
  Archive,
  Building2,
  GitBranch,
  UserCircle,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { MENU_CONFIG } from '../../constants';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  activeModule: string;
  activeSubItem: string;
  onNavigate: (moduleId: string, subId: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const IconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Lock,
  Archive,
  Building2,
  GitBranch,
  Stethoscope,
  GraduationCap
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeModule,
  activeSubItem,
  onNavigate,
  collapsed,
  setCollapsed
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([activeModule]);

  const toggleModule = (id: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedModules([id]);
      return;
    }
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const hasAccess = (moduleId: string, subId?: string) => {
    if (user.role === 'MASTER') return true;

    const perm = user.permissions.find(p => p.moduleId === moduleId);
    if (!perm) return false;
    if (subId) return perm.subModules.includes(subId);
    return true;
  };

  return (
    <aside
      className={`bg-emerald-950 text-emerald-100/70 flex flex-col transition-all duration-300 h-screen sticky top-0 z-50 border-r border-emerald-900/50 ${collapsed ? 'w-20' : 'w-72'}`}
    >
      <div className="p-6 flex items-center justify-center border-b border-emerald-900/50 min-h-[88px] relative overflow-hidden">


        {!collapsed ? (
          <div className="flex items-center justify-center w-full relative z-10">
            <img src="/assets/logo-full.png" alt="EHS PRO" className="h-12 w-auto object-contain filter drop-shadow-md" />
          </div>
        ) : (
          <div className="w-full flex justify-center relative z-10">
            <img src="/assets/logo-icon.png" alt="EHS" className="h-10 w-10 object-contain filter drop-shadow-md" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
        {MENU_CONFIG.filter(item => hasAccess(item.id)).map((item) => {
          const Icon = IconMap[item.icon];
          const isExpanded = expandedModules.includes(item.id);
          const isActive = activeModule === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => toggleModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-900/50 hover:text-white group ${isActive ? 'bg-emerald-900/40 text-emerald-400' : ''}`}
              >
                <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-300'}`}>
                  <Icon size={22} />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-semibold text-sm">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-400' : 'text-emerald-800'}`} />
                  </>
                )}
              </button>

              {!collapsed && isExpanded && (
                <div className="ml-9 mt-1 space-y-1 border-l border-emerald-900/50">
                  {item.subItems.filter(si => hasAccess(item.id, si.id)).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => onNavigate(item.id, sub.id)}
                      className={`w-full text-left px-4 py-2 text-xs rounded-r-lg transition-all duration-200 ${activeSubItem === sub.id ? 'bg-emerald-500/10 text-emerald-300 font-black border-l-2 border-emerald-500' : 'hover:bg-emerald-900/30 hover:text-white text-emerald-100/50 font-medium'}`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info & Toggle Section */}
      <div className="border-t border-emerald-900/50 bg-emerald-950/50">
        <div className={`p-4 transition-opacity duration-300 ${collapsed ? 'items-center' : 'items-start'}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 flex-shrink-0">
              <UserCircle size={24} />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white truncate">{user.name}</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider truncate">{user.functionName || user.role}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex justify-center bg-emerald-900/20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 flex items-center justify-center hover:bg-emerald-900/50 rounded-lg transition-colors text-emerald-400/50 hover:text-emerald-400"
          >
            {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ChevronLeft size={16} /> Recolher Menu</div>}
          </button>
        </div>
      </div>
    </aside>
  );
};


import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@ehspro.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 relative overflow-hidden">
      {/* Decorative blobs for glass depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000 relative z-10">
        
        {/* Main Glass Container */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] px-10 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-2xl shadow-2xl shadow-emerald-500/40 mb-4 border border-white/30 transform transition-transform hover:scale-110 duration-500">
              <span className="text-3xl font-black text-white drop-shadow-md">E</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-sm">EHS PRO</h1>
            <p className="text-emerald-300 text-sm font-medium">Gestão Inteligente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300/50 group-focus-within:text-emerald-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3.5 pl-11 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">Senha Criptografada</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300/50 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3.5 pl-11 pr-11 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300/50 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5 group-hover:border-emerald-500/50'}`}>
                    {rememberMe && <Check size={10} className="text-white font-bold" />}
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-100/70 group-hover:text-white transition-colors">Lembrar-me</span>
              </label>
              <button type="button" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all hover:underline">
                Esqueci a senha
              </button>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black py-3.5 rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              Acessar Painel EHS <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-300 uppercase tracking-[0.2em]">Ambiente 100% Seguro</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

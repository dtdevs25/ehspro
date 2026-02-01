
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(email); // In a real app, we would pass the User object here
      } else {
        setError(data.error || 'Falha no login');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 relative overflow-hidden">
      {/* Decorative blobs for glass depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-[340px] w-full animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000 relative z-10">

        {/* Main Glass Container */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] px-8 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20">

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-2xl shadow-2xl shadow-emerald-500/40 mb-3 border border-white/30 transform transition-transform hover:scale-110 duration-500">
              <span className="text-2xl font-black text-white drop-shadow-md">E</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-0.5 drop-shadow-sm">EHS PRO</h1>
            <p className="text-emerald-300 text-xs font-medium">Gestão Inteligente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-bold text-center">{error}</div>}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50 group-focus-within:text-emerald-400 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3 pl-10 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3 pl-10 pr-10 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/50 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  <div className={`w-3.5 h-3.5 border-2 rounded transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5 group-hover:border-emerald-500/50'}`}>
                    {rememberMe && <Check size={9} className="text-white font-bold" />}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-100/70 group-hover:text-white transition-colors">Lembrar</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black py-3 rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : (
                <>
                  Acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[8px] font-black text-emerald-300 uppercase tracking-[0.2em]">Ambiente Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

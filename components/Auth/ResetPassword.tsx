
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'As senhas não coincidem.' });
            return;
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Senha redefinida com sucesso!' });
                setTimeout(() => {
                    onSuccess();
                }, 3000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Erro ao redefinir senha.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Erro de conexão.' });
        } finally {
            setLoading(false);
        }
    };

    if (status?.type === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 relative overflow-hidden">
                <div className="max-w-[340px] w-full animate-in fade-in zoom-in duration-500">
                    <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] px-8 py-12 shadow-2xl border border-white/20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Sucesso!</h2>
                        <p className="text-emerald-200 text-sm mb-6">Sua senha foi atualizada. Você será redirecionado para o login.</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 animate-[progress_3s_ease-in-out_forwards]" style={{ width: '0%' }} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-[340px] w-full animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000 relative z-10">

                <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] px-8 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20">

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-2xl shadow-2xl shadow-emerald-500/40 mb-3 border border-white/30">
                            <Lock size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-black text-white tracking-tight mb-0.5">Nova Senha</h1>
                        <p className="text-emerald-300 text-xs font-medium">Defina sua nova credencial de acesso</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status?.type === 'error' && (
                            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-bold text-center">
                                {status.message}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">Nova Senha</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3 pl-4 pr-10 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                                    placeholder="Mínimo 6 caracteres"
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

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-3 pl-4 pr-10 transition-all outline-none text-white placeholder:text-white/20 text-sm font-medium"
                                    placeholder="Repita a senha"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black py-3 rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    Redefinir Senha <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

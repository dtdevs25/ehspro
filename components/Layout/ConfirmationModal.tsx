
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">

                <div className={`p-8 flex flex-col items-center text-center gap-4 ${variant === 'danger' ? 'bg-red-50/50' : 'bg-emerald-50/50'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2 ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        <AlertTriangle size={32} strokeWidth={2.5} />
                    </div>

                    <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight">
                        {title}
                    </h3>

                    <p className="text-sm font-medium text-emerald-800/70 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-6 bg-white border-t border-emerald-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-emerald-950/20 hover:text-emerald-950/50 transition-colors">
                    <X size={20} />
                </button>

            </div>
        </div>
    );
};

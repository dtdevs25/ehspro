
import React from 'react';
import { Construction } from 'lucide-react';

export const TrainingIntegration: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100/50">
                <Construction size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-emerald-950">Módulo de Integração em Desenvolvimento</h2>
            <p className="max-w-md text-emerald-600 font-medium">
                Estamos construindo um fluxo completo para onboarding e integração de novos colaboradores. Em breve você poderá gerenciar slides, provas e certificados por aqui.
            </p>
        </div>
    );
};

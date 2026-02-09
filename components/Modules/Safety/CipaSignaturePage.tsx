
import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface CipaSignaturePageProps {
    candidateId: string;
}

export const CipaSignaturePage: React.FC<CipaSignaturePageProps> = ({ candidateId }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const signatureRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState('');

    const [hasSignature, setHasSignature] = useState(false);
    const historyRef = useRef<ImageData | null>(null);

    // Function to restore canvas data
    const restoreCanvas = () => {
        if (historyRef.current && signatureRef.current) {
            const ctx = signatureRef.current.getContext('2d');
            if (ctx) {
                try {
                    ctx.putImageData(historyRef.current, 0, 0);
                } catch (e) {
                    console.error("Failed to restore signature", e);
                }
            }
        }
    };

    // Restore on every render
    React.useLayoutEffect(() => {
        restoreCanvas();
    });

    // Also listen to resize events explicitly to handle orientation changes robustly
    useEffect(() => {
        window.addEventListener('resize', restoreCanvas);
        window.addEventListener('orientationchange', restoreCanvas);
        return () => {
            window.removeEventListener('resize', restoreCanvas);
            window.removeEventListener('orientationchange', restoreCanvas);
        };
    }, []);

    const getCanvasCoordinates = (e: any) => {
        const canvas = signatureRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        // Handle touch vs mouse
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        // Scale coordinates in case canvas CSS size differs from internal size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: any) => {
        if (e.cancelable) e.preventDefault();
        setIsDrawing(true);
        const { x, y } = getCanvasCoordinates(e);
        const ctx = signatureRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        const ctx = signatureRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            if (!hasSignature) setHasSignature(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = signatureRef.current?.getContext('2d');
        ctx?.closePath();

        // Save state history
        if (signatureRef.current && ctx) {
            historyRef.current = ctx.getImageData(0, 0, signatureRef.current.width, signatureRef.current.height);
        }
    };

    const clearSignature = () => {
        const canvas = signatureRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
        setHasSignature(false);
        historyRef.current = null;
    };

    const handleSubmit = async () => {
        const canvas = signatureRef.current;
        if (!canvas) return;

        // Check if empty (simple check: get data, check if all transparent) but assumes user drew something
        const dataUrl = canvas.toDataURL('image/png');

        // Convert DataURL to Blob to File
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "signature.png", { type: "image/png" });

        const formData = new FormData();
        formData.append('signature', file);

        try {
            const apiRes = await fetch(`/api/cipa/candidates/${candidateId}/sign-mobile`, {
                method: 'POST',
                body: formData
            });

            if (apiRes.ok) {
                setIsSubmitted(true);
            } else {
                setError('Erro ao enviar assinatura. Tente novamente.');
            }
        } catch (e) {
            setError('Erro de conexão.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center max-w-sm space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4 animate-in zoom-in">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-emerald-950 uppercase">Sucesso!</h2>
                    <p className="text-sm text-slate-500 font-medium">Sua assinatura foi recebida. Você pode fechar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl border border-emerald-100 overflow-hidden flex flex-col">
                <div className="bg-emerald-600 p-6 text-white text-center">
                    <PenTool size={32} className="mx-auto mb-2 opacity-80" />
                    <h1 className="text-xl font-black uppercase">Assinatura Digital</h1>
                    <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Candidatura CIPA</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-emerald-900 uppercase">Assine Abaixo:</label>
                        </div>
                        <div className="w-full h-64 bg-slate-50 border-2 border-dashed border-emerald-200 rounded-2xl touch-none cursor-crosshair overflow-hidden relative">
                            <canvas
                                ref={signatureRef}
                                width={600}
                                height={400}
                                className="w-full h-full object-contain"
                                style={{ touchAction: 'none' }}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                            {!hasSignature && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 select-none">
                                    <span className="text-2xl font-black text-slate-300 uppercase rotate-[-12deg]">Assine Aqui</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-center text-slate-400">Desenhe sua assinatura com o dedo (celular) ou mouse.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={clearSignature}
                            className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-xl font-bold uppercase hover:bg-slate-200 transition-all text-xs"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!hasSignature}
                            className={`flex-1 py-4 rounded-xl font-black uppercase shadow-lg transition-all text-xs flex items-center justify-center gap-2 ${hasSignature ? 'bg-emerald-600 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Upload size={18} /> Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

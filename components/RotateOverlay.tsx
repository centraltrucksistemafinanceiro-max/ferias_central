import React, { useState } from 'react';
import { Smartphone, RefreshCcw } from 'lucide-react';

const RotateOverlay: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    // Shows only on mobile (md:hidden) AND portrait orientation (portrait:flex)
    // Hides on landscape (landscape:hidden) or if user dismissed it
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex-col items-center justify-center p-8 text-center hidden md:hidden portrait:flex landscape:hidden animate-in fade-in duration-500">
       <div className="relative mb-8 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
         <Smartphone size={64} className="text-slate-500" />
         <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full shadow-lg animate-spin-slow">
            <RefreshCcw size={24} className="text-white" />
         </div>
       </div>
       
       <h2 className="text-2xl font-bold text-white mb-3">Melhor visualização na Horizontal</h2>
       
       <p className="text-slate-400 mb-10 max-w-xs leading-relaxed">
         Gire seu dispositivo para visualizar a tabela completa de férias e todas as informações com mais conforto.
       </p>
       
       <button
         onClick={() => setIsDismissed(true)}
         className="text-sm font-medium text-slate-500 hover:text-white transition-colors border-b border-slate-800 hover:border-slate-500 pb-1"
       >
         Continuar na vertical mesmo assim
       </button>

       {/* Custom animation for slow spin if not in tailwind config */}
       <style>{`
         .animate-spin-slow {
           animation: spin 3s linear infinite;
         }
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
       `}</style>
    </div>
  );
};

export default RotateOverlay;
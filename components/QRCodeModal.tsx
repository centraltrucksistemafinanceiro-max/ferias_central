import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Link, ScanLine } from 'lucide-react';

interface QRCodeModalProps {
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const getReadOnlyUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'readonly');
    return url.toString();
  };

  const qrData = getReadOnlyUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
              <ScanLine size={20} />
            </div>
            <h3 className="text-white font-semibold text-lg">Compartilhar</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-8">
          
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
             <div className="bg-white p-5 rounded-xl relative">
                <QRCodeSVG 
                    value={qrData} 
                    size={200} 
                    level="M"
                    includeMargin={true}
                    className="mx-auto"
                />
             </div>
             
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-[2px] rounded-xl cursor-pointer">
               <a href={qrData} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-full text-white text-sm font-bold flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                 <Link size={16} /> Abrir Link
               </a>
             </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Lista de Férias Pública</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Escaneie para acessar o modo somente leitura com segurança.
            </p>
          </div>

          <button 
             onClick={onClose}
             className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 px-4 rounded-xl transition-colors border border-slate-700"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
import React, { useState, useEffect } from 'react';
import { Save, Calendar, User, ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, X, Calculator, AlertTriangle } from 'lucide-react';
import { Employee } from '../types';

interface RegisterFormProps {
  onSave: (employees: Employee[]) => void;
  onCancel: () => void;
  initialData?: Employee | null;
  existingEmployees?: Employee[];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSave, onCancel, initialData, existingEmployees = [] }) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  
  // Single Mode State
  const [formData, setFormData] = useState({
    name: '',
    admissionDate: '',
    vacationStart: '',
    vacationEnd: '',
    returnDate: ''
  });

  // Batch Mode State
  const [batchText, setBatchText] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState<Employee[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  const convertToInputFormat = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('/')) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (initialData) {
      setMode('single');
      setFormData({
        name: initialData.name,
        admissionDate: convertToInputFormat(initialData.admissionDate),
        vacationStart: convertToInputFormat(initialData.vacationStart),
        vacationEnd: convertToInputFormat(initialData.vacationEnd),
        returnDate: convertToInputFormat(initialData.returnDate)
      });
    }
  }, [initialData]);

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValidationError(null); // Clear error on edit
    
    if (name === 'vacationStart' && value) {
      try {
        // Use T12:00:00 to avoid timezone rolling issues when just setting the date
        const startDate = new Date(`${value}T12:00:00`);
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 29);
        
        const returnDate = new Date(startDate);
        returnDate.setDate(startDate.getDate() + 30);

        const formatDateForInput = (date: Date) => {
          // Use local time methods to avoid UTC shifts
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        setFormData(prev => ({
          ...prev,
          [name]: value,
          vacationEnd: formatDateForInput(endDate),
          returnDate: formatDateForInput(returnDate)
        }));
        return;
      } catch (err) {
        console.error("Erro ao calcular datas", err);
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateStr: string) => {
      if(!dateStr) return '';
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      }
      return dateStr;
  }

  // Helper to add days to a DD/MM/YYYY string and return DD/MM/YYYY
  const addDaysToDateString = (dateStr: string, daysToAdd: number): string => {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return dateStr;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      date.setDate(date.getDate() + daysToAdd);
      
      const newD = String(date.getDate()).padStart(2, '0');
      const newM = String(date.getMonth() + 1).padStart(2, '0');
      const newY = date.getFullYear();
      
      return `${newD}/${newM}/${newY}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to parse dates for comparison
  const parseDateStr = (dateStr: string) => {
    // Expects DD/MM/YYYY
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const parseInputDate = (dateStr: string) => {
    // Expects YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Conflict Validation
    if (formData.vacationStart && formData.vacationEnd) {
      const start = parseInputDate(formData.vacationStart);
      const end = parseInputDate(formData.vacationEnd);
      const nameToCheck = formData.name.trim().toUpperCase();

      const hasConflict = existingEmployees.some(emp => {
        // Skip self if editing
        if (initialData && emp.id === initialData.id) return false;
        
        // Only check same employee name
        if (emp.name.trim().toUpperCase() !== nameToCheck) return false;

        const empStart = parseDateStr(emp.vacationStart);
        const empEnd = parseDateStr(emp.vacationEnd);

        // Check for overlap: StartA <= EndB AND EndA >= StartB
        const isOverlapping = (start <= empEnd && end >= empStart);
        
        if (isOverlapping) {
            console.log("Conflict found with:", emp);
        }

        return isOverlapping;
      });

      if (hasConflict) {
        setValidationError("Conflito detectado: Este funcionário já possui férias agendadas para este período.");
        // Scroll to top to see error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const newEmployee: Employee = {
      id: initialData?.id || Date.now().toString(),
      name: formData.name.toUpperCase(),
      admissionDate: formatDate(formData.admissionDate),
      vacationStart: formatDate(formData.vacationStart),
      vacationEnd: formatDate(formData.vacationEnd),
      returnDate: formatDate(formData.returnDate)
    };
    onSave([newEmployee]);
  };

  const processBatchText = () => {
    if (!batchText.trim()) {
      setParseError("Por favor, cole os dados para processar.");
      return;
    }

    try {
      // Split by newlines first
      let lines = batchText.trim().split('\n');
      
      // If we only have one line (user pasted spaces), try to split by data blocks if possible
      // However, regex matching is safer for mixed inputs
      
      const results: Employee[] = [];
      const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/g;

      lines.forEach((line, index) => {
        if (line.toUpperCase().includes('NOME') && line.toUpperCase().includes('DATA')) {
          return;
        }

        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        let name = '';
        let admission = '';
        let start = '';
        let end = '';
        let ret = '';

        // Strategy: Find all dates in the line.
        // Everything before the first date is the Name.
        // The dates follow order: Admission, Start, End, Return.
        
        const dates = trimmedLine.match(datePattern);
        
        if (dates && dates.length >= 2) {
          // Find where the first date starts to extract name
          const firstDateIndex = trimmedLine.indexOf(dates[0]);
          name = trimmedLine.substring(0, firstDateIndex).trim();
          
          admission = dates[0];
          start = dates[1];
          
          // Use provided dates if available, otherwise calculate
          if (dates.length >= 3) {
            end = dates[2];
          } else {
             end = addDaysToDateString(start, 29); // 30 days total
          }

          if (dates.length >= 4) {
            ret = dates[3];
          } else {
             ret = addDaysToDateString(start, 30); // Return next day
          }

          if (name && start) {
            results.push({
              id: `batch-${Date.now()}-${index}`,
              name: name.toUpperCase(),
              admissionDate: admission,
              vacationStart: start,
              vacationEnd: end,
              returnDate: ret
            });
          }
        }
      });

      if (results.length === 0) {
        setParseError("Nenhum dado válido encontrado. Verifique se o texto contém NOME e DATAS (DD/MM/YYYY).");
      } else {
        setParseError(null);
        setParsedEmployees(results);
      }
    } catch (err) {
      setParseError("Erro ao processar o texto. Verifique a formatação.");
    }
  };

  const handleBatchSave = () => {
    if (parsedEmployees.length > 0) {
      onSave(parsedEmployees);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Voltar para o Dashboard
        </button>
      </div>
      
      {validationError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
            <p className="font-medium">{validationError}</p>
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 px-5 md:px-8 pt-8 pb-0 border-b border-slate-700/50">
           <div className="flex justify-between items-start mb-8">
             <div>
               <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                 {initialData ? 'Editar Férias' : 'Novo Agendamento'}
               </h2>
               <p className="text-indigo-300 mt-2 text-sm md:text-base">
                 {initialData ? 'Atualize as informações do colaborador.' : 'Cadastre férias individualmente ou em massa.'}
               </p>
             </div>
           </div>
           
           {!initialData && (
             <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
               <button
                 onClick={() => setMode('single')}
                 className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all whitespace-nowrap ${
                   mode === 'single' 
                     ? 'bg-slate-800 text-white border-t border-x border-slate-700' 
                     : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                 }`}
               >
                 Cadastro Manual
               </button>
               <button
                 onClick={() => setMode('batch')}
                 className={`px-6 py-3 rounded-t-xl text-sm font-semibold transition-all whitespace-nowrap ${
                   mode === 'batch' 
                     ? 'bg-slate-800 text-white border-t border-x border-slate-700' 
                     : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                 }`}
               >
                 Importação em Lote (Excel/PDF)
               </button>
             </div>
           )}
           {initialData && <div className="h-4"></div>}
        </div>
        
        <div className="p-5 md:p-8 bg-slate-800/30">
          {mode === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleSingleChange}
                      className="pl-11 w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase placeholder:normal-case text-white placeholder-slate-600"
                      placeholder="Ex: JOÃO DA SILVA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Data de Admissão</label>
                    <input
                      required
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleSingleChange}
                      className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Período de Férias</h3>
                    <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 font-medium flex items-center gap-1 border border-indigo-500/20 w-fit">
                      <Calculator size={12} /> Cálculo Automático (30 dias) ao selecionar Início
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-indigo-300 mb-2">Início</label>
                        <input
                          required
                          type="date"
                          name="vacationStart"
                          value={formData.vacationStart}
                          onChange={handleSingleChange}
                          className="w-full p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Fim</label>
                        <input
                          required
                          type="date"
                          name="vacationEnd"
                          value={formData.vacationEnd}
                          onChange={handleSingleChange}
                          className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-300 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-400 mb-2">Retorno ao Trabalho</label>
                        <input
                          required
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleSingleChange}
                          className="w-full p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-200 [color-scheme:dark]"
                        />
                      </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full md:w-auto px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Save size={18} />
                  {initialData ? 'Atualizar Dados' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row gap-4">
                <FileText className="text-indigo-400 flex-shrink-0" size={24} />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-white mb-1">Instruções:</p>
                  <p>Copie os dados do Excel ou PDF e cole abaixo. O sistema identificará automaticamente:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400 text-xs">
                     <li>Nome do Colaborador (texto antes da primeira data)</li>
                     <li>Data de Admissão (1ª data)</li>
                     <li>Início das Férias (2ª data)</li>
                     <li>Fim e Retorno (3ª e 4ª datas, ou calculado se não houver)</li>
                  </ul>
                </div>
              </div>

              {parsedEmployees.length === 0 ? (
                <div className="space-y-4">
                  <textarea
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder="Ex: NOME DATA ADMISSÃO INÍCIO FIM RETORNO&#10;JOÃO SILVA 01/01/2022 01/05/2026 30/05/2026 31/05/2026"
                    className="w-full h-64 p-5 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm text-slate-300 placeholder-slate-600 resize-none"
                  ></textarea>
                  
                  {parseError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/20 p-4 rounded-xl">
                      <AlertCircle size={16} />
                      {parseError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setBatchText('')}
                      className="px-6 py-2.5 rounded-xl text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={processBatchText}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      <Upload size={18} />
                      Processar Dados
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle className="text-emerald-500" size={20} />
                      {parsedEmployees.length} registros identificados
                    </h3>
                    <button 
                      onClick={() => { setParsedEmployees([]); setParseError(null); }}
                      className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <X size={16} /> Descartar
                    </button>
                  </div>

                  <div className="border border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900 sticky top-0">
                        <tr>
                          <th className="p-3 font-semibold text-slate-400">Nome</th>
                          <th className="p-3 font-semibold text-slate-400">Admissão</th>
                          <th className="p-3 font-semibold text-indigo-400">Início</th>
                          <th className="p-3 font-semibold text-emerald-400">Fim</th>
                          <th className="p-3 font-semibold text-emerald-400">Retorno</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {parsedEmployees.map((emp, i) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                            <td className="p-3 font-medium text-white">{emp.name}</td>
                            <td className="p-3 text-slate-400">{emp.admissionDate}</td>
                            <td className="p-3 text-indigo-300 font-medium">{emp.vacationStart}</td>
                            <td className="p-3 text-emerald-300">{emp.vacationEnd}</td>
                            <td className="p-3 text-emerald-300">{emp.returnDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-700/50">
                    <button
                      onClick={handleBatchSave}
                      className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-105"
                    >
                      <Save size={20} />
                      Confirmar Importação
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
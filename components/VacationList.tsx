import React, { useState, useEffect } from 'react';
import { Search, User, ArrowUpDown, Pencil, Trash2, Clock, CalendarDays, CheckCircle2, Plane } from 'lucide-react';
import { Employee } from '../types';

interface VacationListProps {
  employees: Employee[];
  readOnly?: boolean;
  isAdmin?: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: string) => void;
}

// Helper to parse DD/MM/YYYY to Date object (set to midnight)
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper to calculate status and days remaining
const getVacationStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  if (!start || !end) return { status: 'error', text: 'Data Inválida', days: 0 };

  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (now >= start && now <= end) {
    return { status: 'active', text: 'Em Férias 🌴', days: 0 };
  } else if (now > end) {
    return { status: 'completed', text: 'Concluído', days: 0 };
  } else {
    return { status: 'upcoming', text: `Faltam ${diffDays} dias`, days: diffDays };
  }
};

const VacationList: React.FC<VacationListProps> = ({ 
  employees, 
  readOnly = false,
  isAdmin = false,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alterado aqui: Define vacationStart como padrão inicial de ordenação
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>({
    key: 'vacationStart',
    direction: 'asc'
  });

  const handleSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir as férias de ${name}?`)) {
      onDelete?.(id);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    // Check if the key corresponds to a date field
    const isDateField = ['admissionDate', 'vacationStart', 'vacationEnd', 'returnDate'].includes(sortConfig.key);

    if (isDateField) {
      const dateA = parseDate(valA)?.getTime() || 0;
      const dateB = parseDate(valB)?.getTime() || 0;
      
      if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }

    // Default string comparison for names/ids
    if (valA < valB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Determine if actions should be shown (must be logged in as admin and not in readOnly mode)
  const showActions = isAdmin && !readOnly;

  return (
    <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl shadow-black/20">
      {/* Search Header */}
      <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Cronograma <span className="text-indigo-500">.</span>
          </h2>
          <p className="text-sm text-slate-400">
            {readOnly ? 'Visualização de datas e contagem regressiva' : 'Gerencie os períodos de férias'}
          </p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-72 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
          <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th onClick={() => handleSort('name')} className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-400 transition-colors whitespace-nowrap sticky left-0 bg-slate-900/95 z-20 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)] md:shadow-none md:static">
                <div className="flex items-center gap-2">Colaborador <ArrowUpDown size={14} /></div>
              </th>
              
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Status / Contagem
              </th>

              <th onClick={() => handleSort('vacationStart')} className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-400 transition-colors whitespace-nowrap">
                 <div className="flex items-center gap-2">
                   Início 
                   <ArrowUpDown size={14} className={sortConfig?.key === 'vacationStart' ? 'text-indigo-400' : ''} />
                 </div>
              </th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Fim
              </th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Retorno
              </th>
              {showActions && (
                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedEmployees.length > 0 ? (
              sortedEmployees.map((emp, idx) => {
                const status = getVacationStatus(emp.vacationStart, emp.vacationEnd);
                
                return (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-all duration-200 group">
                    <td className="p-5 whitespace-nowrap sticky left-0 bg-slate-900/95 md:bg-transparent z-10 md:z-auto shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)] md:shadow-none">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0
                          ${status.status === 'active' 
                             ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-2 ring-green-500/30' 
                             : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 ring-1 ring-white/5'
                          }`}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block group-hover:text-white transition-colors">
                            {emp.name}
                          </span>
                          <span className="text-xs text-slate-500">Adm: {emp.admissionDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* Countdown / Status Column */}
                    <td className="p-5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm
                        ${status.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          status.status === 'completed' ? 'bg-slate-800 text-slate-500 border-slate-700' : 
                          status.days <= 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                        {status.status === 'active' && <Plane size={14} />}
                        {status.status === 'upcoming' && <Clock size={14} />}
                        {status.status === 'completed' && <CheckCircle2 size={14} />}
                        {status.text}
                      </div>
                    </td>

                    <td className="p-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-300">
                        <CalendarDays size={14} className="text-slate-500" />
                        {emp.vacationStart}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-400 whitespace-nowrap">
                      {emp.vacationEnd}
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-300 whitespace-nowrap">
                      {emp.returnDate}
                    </td>
                    
                    {showActions && (
                      <td className="p-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 transform translate-x-0 md:translate-x-2 md:group-hover:translate-x-0">
                          <button 
                            onClick={() => onEdit?.(emp)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(emp.id, emp.name)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={readOnly ? 5 : 6} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <User size={64} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="text-xl font-medium text-slate-500">Nenhum funcionário encontrado</p>
                    <p className="text-sm">Tente buscar por outro nome.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-500 flex justify-between items-center backdrop-blur-md">
         <span>Mostrando {sortedEmployees.length} registros</span>
         <span className="hidden sm:inline flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Sistema Atualizado
         </span>
      </div>
    </div>
  );
};

export default VacationList;
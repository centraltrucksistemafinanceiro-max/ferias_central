import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Employee } from '../types';

interface MiniCalendarProps {
  employees?: Employee[];
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ employees = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Helper to check if a specific day has any active vacations
  const getDayStatus = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);

    return employees.some(emp => {
       const startParts = emp.vacationStart.split('/');
       const endParts = emp.vacationEnd.split('/');
       
       if (startParts.length !== 3 || endParts.length !== 3) return false;

       const start = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
       const end = new Date(parseInt(endParts[2]), parseInt(endParts[1]) - 1, parseInt(endParts[0]));
       
       start.setHours(0,0,0,0);
       end.setHours(0,0,0,0);

       return checkDate >= start && checkDate <= end;
    });
  };

  const days = [];
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate);

  // Fill empty start days
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-7 w-7" />);
  }

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  for (let i = 1; i <= totalDays; i++) {
    const isToday = isCurrentMonth && i === today.getDate();
    const hasVacation = getDayStatus(i);

    days.push(
      <div 
        key={i} 
        className={`h-7 w-7 flex flex-col items-center justify-center rounded-lg text-xs font-medium cursor-default transition-all relative
          ${isToday 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
      >
        <span>{i}</span>
        {hasVacation && !isToday && (
          <span className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>
        )}
        {hasVacation && isToday && (
          <span className="absolute bottom-1 w-1 h-1 bg-white/50 rounded-full"></span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-auto pt-6 animate-in fade-in duration-700">
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200 capitalize">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-500 font-normal">{currentDate.getFullYear()}</span>
          </h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="h-6 w-7 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {days}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500">
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
             <span>Férias</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
             <span>Hoje</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
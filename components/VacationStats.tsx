import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee } from '../types';

interface VacationStatsProps {
  employees: Employee[];
}

const VacationStats: React.FC<VacationStatsProps> = ({ employees }) => {
  // Define a ordem fixa e correta dos meses
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Inicializa um array de 12 posições com 0
  const countsByMonthIndex = new Array(12).fill(0);
  
  employees.forEach(emp => {
    if (!emp.vacationStart) return;
    
    const parts = emp.vacationStart.split('/');
    if (parts.length === 3) {
      // Pega o mês (segunda parte), converte para número e subtrai 1 para ficar índice 0-11
      const monthIndex = parseInt(parts[1], 10) - 1;
      
      if (monthIndex >= 0 && monthIndex < 12) {
        countsByMonthIndex[monthIndex]++;
      }
    }
  });

  // Mapeia na ordem correta (Jan -> Dez)
  const data = monthNames.map((name, index) => ({
    name: name,
    funcionarios: countsByMonthIndex[index]
  })).filter(item => item.funcionarios > 0); // Remove meses sem férias (opcional: remova o .filter se quiser mostrar meses vazios)

  return (
    <div className="glass-panel p-6 rounded-3xl h-[350px] flex flex-col shadow-xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
        Distribuição Anual
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: '#1e293b', opacity: 0.5 }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #334155', 
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' 
              }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Bar dataKey="funcionarios" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fillOpacity={0.9}
                  fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} 
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VacationStats;
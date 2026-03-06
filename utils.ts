import { Employee } from './types';

// Helper to parse DD/MM/YYYY to Date object (set to midnight)
export const parseDate = (dateStr: string): Date | null => {
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

export const sortEmployees = (
  employees: Employee[], 
  key: keyof Employee, 
  direction: 'asc' | 'desc'
): Employee[] => {
  return [...employees].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    // Check if the key corresponds to a date field
    const isDateField = ['admissionDate', 'vacationStart', 'vacationEnd', 'returnDate'].includes(key);

    if (isDateField) {
      const dateA = parseDate(valA as string)?.getTime() || 0;
      const dateB = parseDate(valB as string)?.getTime() || 0;
      
      if (dateA < dateB) return direction === 'asc' ? -1 : 1;
      if (dateA > dateB) return direction === 'asc' ? 1 : -1;
      return 0;
    }

    // Default string comparison for names/ids
    if (valA < valB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

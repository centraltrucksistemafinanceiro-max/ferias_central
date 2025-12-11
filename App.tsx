import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Briefcase, 
  CalendarCheck,
  QrCode,
  Lock,
  Sparkles,
  FileSpreadsheet,
  Menu,
  X,
  LogOut,
  LogIn,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Employee, ViewState } from './types';
import { INITIAL_DATA } from './constants';
import VacationList from './components/VacationList';
import RegisterForm from './components/RegisterForm';
import QRCodeModal from './components/QRCodeModal';
import VacationStats from './components/VacationStats';
import MiniCalendar from './components/MiniCalendar';
import Toast from './components/Toast';
import RotateOverlay from './components/RotateOverlay';
import LoginModal from './components/LoginModal';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'readonly') {
      setIsReadOnly(true);
    }
  }, []);

  // Check and Seed Users (Admin)
  useEffect(() => {
    const checkAndSeedUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("Nenhum usuário encontrado. Criando admin padrão...");
          await addDoc(usersRef, {
            username: 'admin',
            password: '123451', // Nota: Em produção, usar hash/auth real
            name: 'Administrador'
          });
          console.log("Usuário admin criado com sucesso.");
        }
      } catch (error) {
        console.error("Erro ao verificar usuários:", error);
      }
    };

    checkAndSeedUsers();
  }, []);

  // Firebase Realtime Connection
  useEffect(() => {
    console.log("Iniciando conexão com Firebase...");
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      console.log("Recebidos dados do Firebase:", snapshot.size, "documentos");
      
      const employeesData: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
      
      setEmployees(employeesData);
      setIsLoading(false);

      // Seed database if empty
      if (employeesData.length === 0) {
        console.log("Banco de dados vazio. Iniciando carga de dados iniciais...");
        seedDatabase();
      }
    }, (error) => {
      console.error("Erro ao buscar dados:", error);
      showToast('Erro de conexão com o banco de dados. Verifique o console.', 'error');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const seedDatabase = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_DATA.forEach((emp) => {
        // Create a new reference with a random ID
        const docRef = doc(collection(db, "employees"));
        const { id, ...empData } = emp; 
        batch.set(docRef, empData);
      });
      await batch.commit();
      console.log("Dados iniciais inseridos com sucesso!");
      showToast('Banco de dados populado com sucesso!', 'success');
    } catch (e) {
      console.error("Erro ao popular banco de dados:", e);
      showToast('Erro ao criar dados iniciais.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSaveEmployees = async (newOrUpdatedEmployees: Employee[]) => {
    try {
      if (editingEmployee && newOrUpdatedEmployees.length === 1) {
        // Update existing
        const updated = newOrUpdatedEmployees[0];
        const empRef = doc(db, 'employees', updated.id);
        const { id, ...dataToUpdate } = updated;
        await updateDoc(empRef, dataToUpdate);
        
        setEditingEmployee(null);
        showToast('Férias atualizadas com sucesso!', 'success');
      } else {
        // Add new (Batch or Single)
        const batch = writeBatch(db);
        
        newOrUpdatedEmployees.forEach(emp => {
          const docRef = doc(collection(db, 'employees'));
          const { id, ...empData } = emp; // Strip temporary ID
          batch.set(docRef, empData);
        });

        await batch.commit();
        showToast(`${newOrUpdatedEmployees.length} registro(s) salvo(s) com sucesso!`, 'success');
      }
      setViewState(ViewState.DASHBOARD);
    } catch (error) {
      console.error("Error saving:", error);
      showToast('Erro ao salvar dados.', 'error');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setViewState(ViewState.REGISTER);
    setIsSidebarOpen(false); 
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      showToast('Registro excluído com sucesso.', 'success');
    } catch (error) {
      console.error("Error deleting:", error);
      showToast('Erro ao excluir registro.', 'error');
    }
  };

  const handleCancelRegister = () => {
    setEditingEmployee(null);
    setViewState(ViewState.DASHBOARD);
  };

  const handleSwitchToRegister = () => {
    setEditingEmployee(null);
    setViewState(ViewState.REGISTER);
    setIsSidebarOpen(false);
  };

  const handleNavigate = (view: ViewState) => {
    setViewState(view);
    setIsSidebarOpen(false);
  }

  const handleExportExcel = () => {
    const dataToExport = employees.map(emp => ({
      "Colaborador": emp.name,
      "Data Admissão": emp.admissionDate,
      "Início Férias": emp.vacationStart,
      "Fim Férias": emp.vacationEnd,
      "Data Retorno": emp.returnDate
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const wscols = [
      { wch: 30 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma Férias");

    XLSX.writeFile(workbook, "Controle_Ferias_360.xlsx");
    showToast('Planilha exportada com sucesso!', 'success');
    setIsSidebarOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isReadOnly) {
      e.preventDefault();
      return false;
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setViewState(ViewState.DASHBOARD);
    showToast('Logout realizado.', 'success');
    setIsSidebarOpen(false);
  };

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ id: ViewState.REGISTER, label: 'Novo Agendamento', icon: <PlusCircle size={20} /> });
  }

  // READ ONLY MODE RENDER (Public Link View)
  if (isReadOnly) {
    return (
      <div 
        className="min-h-screen bg-slate-950 text-slate-200 flex flex-col security-protected relative overflow-hidden"
        onContextMenu={handleContextMenu}
      >
        <RotateOverlay />
        
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

        <header className="glass-panel sticky top-0 z-50 px-6 py-4 mb-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <CalendarCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight text-white tracking-tight">Gestão 360</h1>
                <p className="text-xs text-indigo-300 font-medium">Modo Visualização</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <Lock size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Somente Leitura</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-8 relative z-10 max-w-7xl mx-auto w-full">
           {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
             </div>
           ) : (
             <VacationList employees={employees} readOnly={true} />
           )}
        </main>
        
        <footer className="py-6 text-center text-xs text-slate-600">
          Visualização restrita. Sistema Gestão 360.
        </footer>
      </div>
    );
  }

  // STANDARD MODE RENDER (Can be Guest or Admin)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row relative overflow-hidden selection:bg-indigo-500/30">
       <RotateOverlay />

       {/* Ambient Background Effects */}
       <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
       <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

       {/* Toast Notification */}
       {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
       )}

       {/* Login Modal */}
       {showLoginModal && (
         <LoginModal 
           onClose={() => setShowLoginModal(false)}
           onLogin={(status) => {
             setIsAdmin(status);
             if (status) showToast('Bem-vindo, Administrador!', 'success');
           }}
         />
       )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
               <CalendarCheck size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Gestão 360</span>
         </div>
         <button 
           onClick={() => setIsSidebarOpen(true)}
           className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none 
        border-r border-slate-800/50 flex flex-col transition-transform duration-300 ease-in-out md:static md:transform-none md:min-h-screen
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/20 ring-1 ring-white/10">
              <CalendarCheck size={24} className="md:w-[26px] md:h-[26px]" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">Gestão 360</h1>
              <p className="text-xs text-indigo-400 font-medium">
                {isAdmin ? 'Admin Dashboard' : 'Visitante'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-6 space-y-3 flex-1 flex flex-col overflow-y-auto">
          <div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === ViewState.REGISTER) handleSwitchToRegister();
                  else handleNavigate(item.id);
                }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group mb-3 ${
                  viewState === item.id 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span className={`transition-transform duration-300 ${viewState === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-800/50 space-y-3">
             <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 group border border-transparent hover:border-emerald-500/20"
            >
              <FileSpreadsheet size={20} className="group-hover:text-emerald-400 transition-colors" />
              <span className="font-medium">Exportar Excel</span>
            </button>
             
             <button
              onClick={() => { setShowQRModal(true); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-slate-800/50 hover:text-white group"
            >
              <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Gerar QR da Lista</span>
            </button>

            {/* Auth Button */}
            {isAdmin ? (
               <button
                 onClick={handleLogout}
                 className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-red-500/10 hover:text-red-400 group border border-transparent hover:border-red-500/20 mt-4"
               >
                 <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                 <span className="font-medium">Sair (Admin)</span>
               </button>
            ) : (
               <button
                 onClick={() => { setShowLoginModal(true); setIsSidebarOpen(false); }}
                 className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 group border border-transparent hover:border-indigo-500/20 mt-4"
               >
                 <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                 <span className="font-medium">Acesso Admin</span>
               </button>
            )}
          </div>

          <MiniCalendar employees={employees} />
        </nav>

        <div className="p-6 hidden md:block">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
             <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Total de Colaboradores</p>
             <p className="text-3xl font-bold text-white tracking-tight">
               {isLoading ? <span className="animate-pulse">...</span> : employees.length}
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto relative z-20 scroll-smooth w-full">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="md:hidden flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-white tracking-tight">
               {viewState === ViewState.DASHBOARD ? 'Painel Geral' : 'Cadastro'}
             </h2>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in">
               <Loader2 size={64} className="text-indigo-500 animate-spin mb-4" />
               <p className="text-slate-400 font-medium">Carregando dados do servidor...</p>
             </div>
          ) : (
            <>
              {viewState === ViewState.DASHBOARD && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:bg-slate-800/40 transition-colors duration-300">
                        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                          <Users size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Total na Base</p>
                          <p className="text-3xl font-bold text-white">{employees.length}</p>
                        </div>
                     </div>
                     <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:bg-slate-800/40 transition-colors duration-300">
                        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                          <Briefcase size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Férias em 2026</p>
                          <p className="text-3xl font-bold text-white">
                            {employees.filter(e => e.vacationStart.includes('2026')).length}
                          </p>
                        </div>
                     </div>
                     <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 hover:bg-slate-800/40 transition-colors duration-300">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                          <Wifi size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Status do Sistema</p>
                          <p className="text-lg font-bold text-emerald-400">Online</p>
                        </div>
                     </div>

                     <div className="md:col-span-3">
                        <VacationStats employees={employees} />
                     </div>
                  </div>

                  {/* List Component */}
                  <VacationList 
                    employees={employees} 
                    readOnly={false}
                    isAdmin={isAdmin}
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </div>
              )}

              {viewState === ViewState.REGISTER && isAdmin && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <RegisterForm 
                    onSave={handleSaveEmployees} 
                    onCancel={handleCancelRegister}
                    initialData={editingEmployee}
                    existingEmployees={employees}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showQRModal && (
        <QRCodeModal 
          onClose={() => setShowQRModal(false)} 
        />
      )}
    </div>
  );
}

export default App;
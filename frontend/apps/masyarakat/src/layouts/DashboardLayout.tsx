import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, History, LogOut, Bell, Menu, X, BookOpen, Ticket, Activity, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import AiChatWidget from '../components/AiChatWidget';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', label: 'Beranda', icon: LayoutDashboard },
  { path: '/antri', label: 'Nomor Antrian', icon: Ticket },
  { path: '/kms', label: 'KMS Digital', icon: FileText },
  { path: '/jadwal', label: 'Jadwal Posyandu', icon: Calendar },
  { path: '/riwayat', label: 'Riwayat Layanan', icon: History },
  { path: '/edukasi', label: 'Edukasi & Info', icon: BookOpen },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  
  // UI State
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Cross-port SSO handler: Check if token is passed via URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const userParam = params.get('user');

    let token = localStorage.getItem('auth_token');

    if (tokenParam && userParam) {
      localStorage.setItem('auth_token', tokenParam);
      localStorage.setItem('auth_user', userParam);
      window.history.replaceState({}, document.title, window.location.pathname);
      token = tokenParam;
      setUser(JSON.parse(userParam));
    } else {
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        setUser(JSON.parse(userData)); // Set sementara dari cache agar UI tidak blank
      } else {
        window.location.href = 'http://localhost:5173/login';
        return;
      }
    }

    // Selalu refresh dari API agar data terbaru (termasuk kategori_warga) tidak ketinggalan
    if (token) {
      import('../lib/api').then(({ default: api }) => {
        api.get('/auth/me')
          .then(res => {
            const freshUser = res.data.data;
            setUser(freshUser);
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // Token mungkin sudah expired — redirect ke login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = 'http://localhost:5173/login';
          });
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = 'http://localhost:5173/login';
  };

  const handleTanyaBidan = () => {
    window.open('https://wa.me/6281234567890?text=Halo%20Bidan%20Desa%20Tubanan,%20saya%20ingin%20konsultasi%20mengenai%20kesehatan%20balita%20saya.', '_blank');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">Portal Warga</span>
          </div>
          <button 
            className="ml-auto p-2 lg:hidden text-slate-400 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Menu Utama</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex-shrink-0 space-y-2">
          {/* Tanya Bidan Button */}
          <button
            onClick={handleTanyaBidan}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-sm">Tanya Bidan</span>
              <span className="text-[10px] opacity-80">Konsultasi Darurat (WA)</span>
            </div>
          </button>

          {/* Profil Button */}
          <button
            onClick={() => { setIsSidebarOpen(false); setShowProfile(true); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">Profil Saya</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>
              
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800">Notifikasi</h3>
                      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">2 Baru</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Jadwal Posyandu
                        </p>
                        <p className="text-xs text-blue-600 mt-1 leading-relaxed">Jangan lupa jadwal posyandu bulan ini. Segera cek menu Jadwal untuk mendaftar antrian!</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <History className="w-4 h-4" /> Riwayat Tersimpan
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hasil pemeriksaan terakhir Anda telah divalidasi oleh Bidan.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-8 w-px bg-slate-200" />
            
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 text-left focus:outline-none group">
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {(user.kategori_warga || 'sasaran') === 'sasaran' ? 'Warga Tubanan' : 'Pengunjung'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-inner group-hover:ring-4 group-hover:ring-blue-50 transition-all">
                {user.name.charAt(0)}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors z-10">
                <X className="w-5 h-5"/>
              </button>
              
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 text-3xl font-bold shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-blue-100 text-sm font-mono tracking-widest">{user.nik}</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4" /> Kategori Warga
                  </p>
                  <p className="text-sm font-bold text-slate-800 bg-slate-100 inline-flex items-center px-3 py-1.5 rounded-lg">
                    {(user.kategori_warga || 'sasaran') === 'sasaran' ? 'Warga Tetap (Sasaran)' : 'Pengunjung Luar Daerah'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Alamat Asal
                  </p>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {user.alamat_asal || 'Desa Tubanan'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Si Posya AI Chat Widget — floats on all pages */}
      <AiChatWidget />
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

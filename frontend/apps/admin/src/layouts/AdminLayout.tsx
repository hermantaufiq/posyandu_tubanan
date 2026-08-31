import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, FileBarChart, MapPin,
  LogOut, Menu, X, Settings, Megaphone,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import api from '../lib/api';

const PREFETCH_MAP: Record<string, string[]> = {
  '/': ['/admin/dashboard'],
  '/pengumuman': ['/admin/pengumuman'],
  '/master-kegiatan': ['/admin/jadwal', '/admin/posyandus'],
  '/users': ['/admin/users'],
  '/laporan-kader': ['/admin/laporan-kader'],
  '/laporan': ['/admin/laporan/antrian', '/admin/laporan/pemeriksaan'],
  '/posyandu': ['/admin/posyandu'],
  '/pengaturan': ['/admin/invite-codes'],
  '/rekap-sasaran': ['/admin/laporan/rekap-sasaran'],
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('admin_auth_user') || '{}');
  const { theme, toggleTheme } = useTheme();
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  useEffect(() => {
    const fetchBadge = () => {
      api.get('/admin/laporan-kader').then(res => {
        const { fotos = [], pws = [] } = res.data;
        const count = [...fotos, ...pws].filter(r => r.status === 'menunggu_verifikasi').length;
        setUnverifiedCount(count);
      }).catch(() => {});
    };

    fetchBadge();
    const interval = setInterval(fetchBadge, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const NAV_GROUPS = [
    {
      title: '',
      items: [
        { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
        { to: '/profil-desa', label: 'Profil Desa', icon: MapPin },
        { to: '/sk-posyandu', label: 'SK TP Posyandu',icon: FileBarChart },
      ]
    },
    {
      title: 'Laporan & Statistik',
      items: [
        { to: '/posyandu',          label: 'Rekap Posyandu',          icon: Users },
        { to: '/rekap-sasaran',     label: 'Rekap Sasaran Kesehatan', icon: FileBarChart },
        { to: '/laporan-spm',       label: 'Rekap Laporan SPM',       icon: FileBarChart },
      ]
    },
    {
      title: 'Kegiatan',
      items: [
        { to: '/master-kegiatan',   label: 'Master Kegiatan',         icon: CalendarDays },
        { to: '/verifikasi',        label: 'Verifikasi Laporan PWS & Foto', icon: FileBarChart, badge: unverifiedCount > 0 ? unverifiedCount.toString() : null },
      ]
    },
    {
      title: 'Pengaturan Umum',
      items: [
        { to: '/pengaturan',        label: 'Pengaturan',              icon: Settings },
        { to: '/users',             label: 'Pengguna',                icon: Users },
        { to: '/pengumuman',        label: 'Pengumuman',              icon: Megaphone },
        { to: '/laporan',           label: 'Laporan Antrian',         icon: FileBarChart },
      ]
    }
  ];

  const logout = () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_user');
    window.location.href = '/login';
  };

  const handlePrefetch = (path: string) => {
    const endpoints = PREFETCH_MAP[path];
    if (endpoints) {
      endpoints.forEach(ep => {
        api.get(ep).catch(() => {});
      });
    }
  };

  const getPageTitle = () => {
    for (const group of NAV_GROUPS) {
      const item = group.items.find(n => location.pathname === n.to || (n.to !== '/' && location.pathname.startsWith(n.to)));
      if (item) return item.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
          <img src="/logo.png" alt="SIPO Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-white tracking-tight">SIPO-Terpadu Tubanan</p>
            <p className="text-[10px] text-slate-500 font-medium">Posyandu Tubanan</p>
          </div>
          <button className="lg:hidden ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx}>
              {group.title && (
                <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'));
                  return (
                    <Link key={item.to} to={item.to}
                      onMouseEnter={() => handlePrefetch(item.to)}
                      onFocus={() => handlePrefetch(item.to)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}>
                      <item.icon className="w-[18px] h-[18px]" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-rose-400 transition-colors" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sponsor Bar */}
        <div className="px-3 pb-3 border-t border-slate-200 dark:border-slate-800 pt-3">
          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center mb-2">Program KKN UNISNU Jepara</p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-sm">
                <span className="text-white text-[8px] font-black">KKN</span>
              </div>
              <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">Desa<br/>Tubanan</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <span className="text-white text-[7px] font-black leading-tight text-center">UNI<br/>SNU</span>
              </div>
              <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">UNISNU<br/>Jepara</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-4 lg:px-6 sticky top-0 z-30 justify-between">
          <div className="flex items-center">
            <button className="lg:hidden mr-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-200 capitalize">
              {getPageTitle()}
            </h1>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

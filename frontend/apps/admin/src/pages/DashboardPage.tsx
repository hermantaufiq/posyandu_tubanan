import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Activity, CalendarDays, TrendingUp, Sun, FileCheck2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time clock for the Hero Bento
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = [
    { title: 'Total Warga', value: data?.stats.total_warga || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    { title: 'Antrian Hari Ini', value: data?.stats.antrian_hari_ini || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { title: 'Pemeriksaan', value: data?.stats.pemeriksaan_bulan || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    { title: 'Jadwal Aktif', value: data?.stats.jadwal_aktif || 0, icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
  ];

  const greeting = currentTime.getHours() < 12 ? 'Selamat Pagi' : currentTime.getHours() < 18 ? 'Selamat Siang' : 'Selamat Malam';
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="space-y-6">
      
      {/* --- HERO BENTO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Welcome Box (col-span-3) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-blue-900/10 flex flex-col justify-between min-h-[220px]">
          {/* Decorative blur elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-pink-500/20 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-blue-100 font-bold tracking-widest text-xs uppercase mb-2">Sistem Informasi Posyandu Terpadu</p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {greeting}, <br />Admin SIPO! 👋
              </h1>
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-bold">{currentTime.toLocaleDateString('id-ID', dateOptions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action / Alert Box (col-span-1) */}
        <Link to="/laporan-kader" className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-2xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-bl-2xl shadow-sm">Tugas</div>
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileCheck2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">Cek Laporan PWS Kader</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ada {data?.stats.total_posyandu || 0} posyandu aktif.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-emerald-600 dark:text-emerald-400">
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
      </div>

      {/* --- GRID STATS & CHART BENTO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 4 Small Bento Boxes for Stats */}
        {stats.map((s, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
             <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${s.bg} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">{s.value}</p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN CHART & LIST BENTO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Chart Box */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Tren Kunjungan</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Akumulasi kunjungan bulanan tahun ini</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold">
              Grafik Area
            </div>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.kunjungan_bulanan || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineColorBento" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="areaColorBento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="bulan" stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--tw-colors-slate-900)', 
                    borderColor: 'transparent', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                  }}
                  itemStyle={{ color: '#60a5fa', fontWeight: '900', fontSize: '14px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="url(#lineColorBento)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#areaColorBento)" 
                  activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tall List Box */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 flex flex-col max-h-[440px]">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">Live Antrian</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Aktivitas pendaftaran real-time</p>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {data?.antrian_terbaru?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-bold">Belum ada aktivitas</p>
              </div>
            )}
            {data?.antrian_terbaru?.map((a: any) => (
              <div key={a.id} className="group relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors py-1">
                <div className="absolute -left-[5px] top-2.5 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{a.nama || 'Warga'}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{a.posyandu} • {a.jenis}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                    a.status === 'selesai' ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30' : 
                    a.status === 'menunggu' ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30' : 
                    'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

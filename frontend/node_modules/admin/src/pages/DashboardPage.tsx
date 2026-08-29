import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, MapPin, Heart, FileText, Search, LogOut } from 'lucide-react';
import api from '../lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    { title: 'Total Posyandu', value: data?.stats.total_posyandu || 0, icon: MapPin, sub: 'Posyandu di wilayah Anda', color: 'text-blue-600' },
    { title: 'Total Kader Aktif', value: data?.stats.total_kader || 0, icon: Users, sub: 'Kader terdaftar', color: 'text-emerald-600' },
    { title: 'Total Sasaran Kesehatan', value: data?.stats.total_sasaran || 0, icon: Heart, sub: 'Bulan Agustus 2026', color: 'text-amber-500' },
    { title: 'Sasaran KIA (Bumil & Balita)', value: data?.stats.sasaran_kia || 0, icon: Heart, sub: 'Bulan Agustus 2026', color: 'text-blue-500' },
  ];

  const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
      
      {/* Welcome Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selamat Datang</h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">TUBANAN</p>
        </div>
        <button onClick={() => {
            localStorage.removeItem('admin_auth_token');
            window.location.href = '/login';
          }} 
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{s.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{s.value}</h3>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${s.color}`}>
              {s.sub} <s.icon className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Proporsi Sasaran Kesehatan Bulan Ini</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stats?.proporsi || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={60} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {
                    (data?.stats?.proporsi || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Bumil</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Balita</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Remaja</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dewasa</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Lansia</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Tren Sasaran Kesehatan (6 Bulan)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.tren_sasaran || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Laporan Kegiatan Terbaru */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Laporan Kegiatan Terbaru
          </h3>
        </div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari" className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Posyandu</th>
                <th className="px-6 py-4">Tanggal <span>▼</span></th>
                <th className="px-6 py-4">Status <span>▼</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.kegiatan_terbaru?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada kegiatan.</td></tr>
              ) : data?.kegiatan_terbaru?.map((k: any) => (
                <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Pelayanan {k.kegiatan}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 uppercase font-medium">{k.posyandu}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{k.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                      Disetujui
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Posyandu Belum Update Sasaran */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-rose-500">▲</span> Posyandu Belum Update Sasaran (Bulan Ini)
          </h3>
        </div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari" className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Nama Posyandu</th>
                <th className="px-6 py-4">Desa/Kelurahan</th>
                <th className="px-6 py-4">Kecamatan</th>
                <th className="px-6 py-4">Terakhir Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.posyandu_belum_update?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Semua posyandu sudah update sasaran.</td></tr>
              ) : data?.posyandu_belum_update?.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200 uppercase">{p.nama}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 uppercase">{p.desa}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 uppercase">{p.kecamatan}</td>
                  <td className="px-6 py-4 text-slate-400">{p.terakhir_update}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

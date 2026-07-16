import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Activity, CalendarDays, TrendingUp } from 'lucide-react';
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
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = [
    { title: 'Total Warga', value: data?.stats.total_warga || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Antrian Hari Ini', value: data?.stats.antrian_hari_ini || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Pemeriksaan Bulan Ini', value: data?.stats.pemeriksaan_bulan || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Jadwal Aktif', value: data?.stats.jadwal_aktif || 0, icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{s.title}</p>
              <p className="text-2xl font-bold text-slate-200 mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-base font-bold text-slate-200 mb-6">Grafik Kunjungan (6 Bulan Terakhir)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.kunjungan_bulanan || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="bulan" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-200">Antrian Terbaru</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {data?.antrian_terbaru?.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-10">Belum ada data antrian.</p>
            )}
            {data?.antrian_terbaru?.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm text-slate-200 truncate pr-2">{a.nama || 'Warga'}</p>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex-shrink-0">
                    {a.nomor_antri}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-slate-400">{a.jenis} • {a.posyandu}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    a.status === 'selesai' ? 'text-emerald-400 bg-emerald-400/10' : 
                    a.status === 'menunggu' ? 'text-amber-400 bg-amber-400/10' : 
                    'text-blue-400 bg-blue-400/10'
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

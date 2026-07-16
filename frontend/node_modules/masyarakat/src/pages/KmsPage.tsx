import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export default function KmsPage() {
  const [activeTab, setActiveTab] = useState<'berat' | 'tinggi'>('berat');
  const [kmsData, setKmsData] = useState<any[]>([]);
  const [balita, setBalita] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/masyarakat/kms')
      .then(res => {
        setKmsData(res.data.data);
        setBalita(res.data.balita);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!balita) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-slate-500">
        Data KMS Balita tidak ditemukan atau Anda belum mendaftarkan anak.
      </div>
    );
  }

  // Calculate some stats based on actual data
  const lastPemeriksaan = kmsData[kmsData.length - 1];
  const ageStr = `${Math.floor((new Date().getTime() - new Date(balita.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365))} Thn`;
  const genderStr = balita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">KMS Digital</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Grafik pertumbuhan anak sesuai standar WHO</p>
      </div>

      {/* Child Selector */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
          {balita.nama.substring(0,2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{balita.nama}</p>
          <p className="text-xs text-slate-500">{ageStr} • {genderStr}</p>
        </div>
        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
          <CheckCircle2 className="w-3 h-3" /> Baik
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Status Gizi', value: 'Baik', sub: 'Sesuai standar', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Berat Terakhir', value: lastPemeriksaan ? `${lastPemeriksaan.berat} kg` : '-', sub: lastPemeriksaan ? lastPemeriksaan.bulan : '-', color: 'text-blue-600', bg: 'bg-blue-50', icon: Activity },
          { label: 'Tinggi Terakhir', value: lastPemeriksaan ? `${lastPemeriksaan.tinggi} cm` : '-', sub: lastPemeriksaan ? lastPemeriksaan.bulan : '-', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: TrendingUp },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">{stat.label}</p>
              <p className={`text-sm sm:text-xl font-bold ${stat.color} mt-0.5`}>{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm"
      >
        {/* Tab Switcher */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Grafik Pertumbuhan</h3>
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setActiveTab('berat')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${activeTab === 'berat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >Berat</button>
            <button onClick={() => setActiveTab('tinggi')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${activeTab === 'tinggi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >Tinggi</button>
          </div>
        </div>

        <div className="h-56 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'berat' ? (
              <AreaChart data={kmsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBerat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" name="Berat Anak (kg)" dataKey="berat" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorBerat)" />
                <Line type="monotone" name="Standar WHO" dataKey="standar" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            ) : (
              <AreaChart data={kmsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTinggi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" name="Tinggi Anak (cm)" dataKey="tinggi" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorTinggi)" />
                <Line type="monotone" name="Standar WHO" dataKey="standar" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">Data diperbarui setelah kunjungan Posyandu berikutnya</p>
      </motion.div>
    </div>
  );
}

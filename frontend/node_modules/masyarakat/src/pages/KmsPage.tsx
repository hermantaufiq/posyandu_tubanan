import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { User, Calendar, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const mockKmsData = [
  { month: 'Jan', weight: 8.5, height: 75, standard_w: 8.5 },
  { month: 'Feb', weight: 8.9, height: 76, standard_w: 8.8 },
  { month: 'Mar', weight: 9.2, height: 78, standard_w: 9.1 },
  { month: 'Apr', weight: 9.5, height: 80, standard_w: 9.4 },
  { month: 'Mei', weight: 9.9, height: 82, standard_w: 9.7 },
  { month: 'Jun', weight: 10.2, height: 84, standard_w: 10.0 },
];

export default function KmsPage() {
  const [selectedChild] = useState({ name: 'Ananda Budi', age: '2 Thn 4 Bln', gender: 'Laki-laki' });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">KMS Digital</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau grafik pertumbuhan anak Anda sesuai standar WHO</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">AB</div>
          <div className="pr-4">
            <p className="text-sm font-semibold text-slate-800">{selectedChild.name}</p>
            <p className="text-xs text-slate-500">{selectedChild.age} • {selectedChild.gender}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Activity className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Status Gizi</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">Gizi Baik</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Sesuai dengan kurva pertumbuhan</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Activity className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Berat Badan Terakhir</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">10.2 <span className="text-sm font-medium text-slate-500">kg</span></p>
          <p className="text-xs text-blue-600 font-medium mt-1">Diukur: 12 Jun 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Activity className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Tinggi Badan Terakhir</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">84 <span className="text-sm font-medium text-slate-500">cm</span></p>
          <p className="text-xs text-indigo-600 font-medium mt-1">Diukur: 12 Jun 2026</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Grafik Pertumbuhan (Berat Badan)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockKmsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" name="Berat Anak (kg)" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              <Line type="monotone" name="Standar WHO (kg)" dataKey="standard_w" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Download, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const MOCK_POSYANDU = [
  { id: 1, name: "MEKAR SARI", total: 0 },
  { id: 2, name: "PUNJUL REJO", total: 0 },
  { id: 3, name: "SIDO ASIH", total: 0 },
  { id: 4, name: "SIDO JAYA", total: 0 },
  { id: 5, name: "SIDO MAKMUR", total: 0 },
  { id: 6, name: "SIDO MULYO", total: 0 },
  { id: 7, name: "TIMBUL JAYA", total: 0 },
];

const MOCK_TREND = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'Mei', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
  { name: 'Agu', value: 0 },
  { name: 'Sep', value: 0 },
  { name: 'Okt', value: 0 },
  { name: 'Nov', value: 0 },
  { name: 'Des', value: 0 },
];

export default function LaporanSpmPage() {
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [laporan, setLaporan] = useState<{fotos: any[], pws: any[]}>({ fotos: [], pws: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/laporan-kader")
      .then(res => {
        setLaporan({
          fotos: res.data.fotos || [],
          pws: res.data.pws || []
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allReports = [...laporan.fotos, ...laporan.pws];
  const totalLaporan = allReports.length;
  const totalSelesai = allReports.filter(r => r.status === 'terverifikasi').length;
  const totalPending = allReports.filter(r => r.status === 'menunggu_verifikasi').length;

  const getPosyanduTotal = (name: string) => {
    return allReports.filter(r => r.posyandu?.name?.toUpperCase().includes(name.toUpperCase())).length;
  };

  return (
    <div className="p-8 pb-24 font-sans text-slate-800 dark:text-slate-200 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">
            Rekap Laporan SPM <span className="mx-2">&rsaquo;</span> Daftar
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Rekap Laporan SPM
          </h1>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">Total Laporan</p>
          <p className="text-4xl font-black">{loading ? "..." : totalLaporan}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">Selesai Ditindaklanjuti</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{loading ? "..." : totalSelesai}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">Belum Ditindaklanjuti (Pending)</p>
          <p className="text-4xl font-black text-amber-500 dark:text-amber-400">{loading ? "..." : totalPending}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Distribusi Laporan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col min-h-[300px]">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Distribusi Laporan per Kategori SPM</h3>
          <div className="flex-1 flex flex-col justify-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[]} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 1]} tickCount={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Komposisi Laporan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col min-h-[300px]">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Komposisi Laporan per Kategori SPM</h3>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 italic text-sm text-center">
              Belum ada laporan pada periode atau filter wilayah terpilih.
            </p>
          </div>
        </div>

      </div>

      {/* Tren Bulanan */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Tren Bulanan Laporan SPM</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis domain={[-1, 1]} tickCount={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-sm"></div>
            Jumlah Laporan
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 px-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Kab. Jepara/KEMBANG/TUBANAN
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Bulan<span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
              >
                <option value="">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Tahun<span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Rekapitulasi per Posyandu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Nama Posyandu</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Total Laporan</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_POSYANDU.map((pos) => {
                const total = getPosyanduTotal(pos.name);
                return (
                  <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{pos.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{loading ? "..." : total} Laporan</td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/verifikasi" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 text-sm">
                        Lihat Laporan <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

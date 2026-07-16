import { useState, useEffect } from 'react';
import { FileBarChart, Calendar, Download } from 'lucide-react';
import api from '../lib/api';

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/laporan/antrian')
      .then(res => setLaporan(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Laporan & Rekap Kegiatan</h2>
          <p className="text-sm text-slate-400">Rekapitulasi kehadiran antrian posyandu</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors w-fit">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat laporan...</div>
        ) : laporan.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            <FileBarChart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada data laporan kegiatan.</p>
          </div>
        ) : laporan.map(j => (
          <div key={j.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-200 mb-1">{j.kegiatan}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" /> {new Date(j.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-medium">{j.posyandu}</span>
                </div>
              </div>
              <div className="flex gap-2 text-center">
                <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-2xl font-black text-blue-400 leading-none">{j.total}</p>
                  <p className="text-[10px] font-bold text-blue-300 uppercase mt-1 tracking-wider">Total Antrian</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-2xl font-black text-emerald-400 leading-none">{j.hadir}</p>
                  <p className="text-[10px] font-bold text-emerald-300 uppercase mt-1 tracking-wider">Hadir</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-2xl font-black text-slate-300 leading-none">{j.tidak_hadir}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Tidak Hadir</p>
                </div>
              </div>
            </div>

            {j.antrians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {j.antrians.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-200 truncate pr-2">{a.nama}</p>
                      <p className="text-[11px] text-slate-400">{a.jenis}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      a.status === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      a.status === 'menunggu' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada warga yang mendaftar pada jadwal ini.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

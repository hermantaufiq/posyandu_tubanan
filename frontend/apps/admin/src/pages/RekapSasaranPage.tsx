import { useState, useEffect } from 'react';
import { Download, Users, Heart, GraduationCap, Sparkles } from 'lucide-react';
import api from '../lib/api';

export default function RekapSasaranPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/laporan/rekap-sasaran', {
        params: { bulan, tahun }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, [bulan, tahun]);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Memuat data rekap sasaran...</div>;
  }

  const { totals, posyandu } = data;
  const totalKeseluruhan = totals.bumil + totals.balita + totals.remaja + totals.dewasa + totals.lansia;
  const sasaranKIA = totals.bumil + totals.balita;
  const usiaProduktif = totals.remaja + totals.dewasa;

  const getPercentage = (val: number) => {
    if (totalKeseluruhan === 0) return '0%';
    return Math.round((val / totalKeseluruhan) * 100) + '%';
  };

  const getBarWidth = (val: number) => {
    if (totalKeseluruhan === 0) return '0%';
    return Math.max(1, Math.round((val / totalKeseluruhan) * 100)) + '%';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rekap Sasaran Kesehatan</h2>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Sasaran</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{totalKeseluruhan}</h3>
          <p className="text-xs text-blue-600 flex items-center gap-1"><Users className="w-3 h-3"/> Total sasaran kesehatan terdata</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Ibu & Balita (KIA)</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{sasaranKIA}</h3>
          <p className="text-xs text-rose-500 flex items-center gap-1"><Heart className="w-3 h-3"/> Sasaran prioritas KIA & Stunting</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Usia Produktif</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{usiaProduktif}</h3>
          <p className="text-xs text-emerald-500 flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Sasaran Remaja & Dewasa</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Lansia</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{totals.lansia}</h3>
          <p className="text-xs text-amber-500 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Sasaran Lansia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Proporsi Kelompok Sasaran</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                <span>Ibu Hamil</span><span>{totals.bumil}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: getBarWidth(totals.bumil) }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                <span>Balita</span><span>{totals.balita}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: getBarWidth(totals.balita) }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                <span>Remaja</span><span>{totals.remaja}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: getBarWidth(totals.remaja) }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                <span>Dewasa</span><span>{totals.dewasa}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: getBarWidth(totals.dewasa) }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                <span>Lansia</span><span>{totals.lansia}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: getBarWidth(totals.lansia) }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Komposisi Detail Sasaran</h3>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Ibu Hamil</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.bumil} <span className="text-slate-400 text-xs font-normal">({getPercentage(totals.bumil)})</span></span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Balita</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.balita} <span className="text-slate-400 text-xs font-normal">({getPercentage(totals.balita)})</span></span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Remaja</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.remaja} <span className="text-slate-400 text-xs font-normal">({getPercentage(totals.remaja)})</span></span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Dewasa</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.dewasa} <span className="text-slate-400 text-xs font-normal">({getPercentage(totals.dewasa)})</span></span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-medium text-slate-700 dark:text-slate-300">Lansia</span>
              <span className="font-bold text-slate-900 dark:text-white">{totals.lansia} <span className="text-slate-400 text-xs font-normal">({getPercentage(totals.lansia)})</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Kab. Jepara/KEMBANG/TUBANAN</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Bulan<span className="text-rose-500">*</span></label>
              <select className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-950 focus:outline-none w-32" value={bulan} onChange={e => setBulan(e.target.value)}>
                <option value="">Semua Bulan</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Tahun<span className="text-rose-500">*</span></label>
              <select className="border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-950 focus:outline-none w-32" value={tahun} onChange={e => setTahun(e.target.value)}>
                <option value="">Semua Tahun</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rekapitulasi per Posyandu Desa TUBANAN</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Nama Posyandu</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">Bumil</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">Balita</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center hidden sm:table-cell">Remaja</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center hidden sm:table-cell">Dewasa</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center">Lansia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {posyandu.map((p: any) => (
                <tr key={p.nama} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200 uppercase">{p.nama}</td>
                  {p.updated ? (
                    <>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{p.bumil}</td>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{p.balita}</td>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{p.remaja}</td>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{p.dewasa}</td>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{p.lansia}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-center text-slate-400 italic">Belum Update</td>
                      <td className="px-6 py-4 text-center text-slate-400 italic">Belum Update</td>
                      <td className="px-6 py-4 text-center text-slate-400 italic">Belum Update</td>
                      <td className="px-6 py-4 text-center text-slate-400 italic">Belum Update</td>
                      <td className="px-6 py-4 text-center text-slate-400 italic">Belum Update</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

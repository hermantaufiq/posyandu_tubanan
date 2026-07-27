import { useState, useEffect } from "react";
import { Image as ImageIcon, FileSpreadsheet, CheckCircle2, Activity, CalendarDays, Maximize2, X } from "lucide-react";
import api from "../lib/api";
import { Download, Printer } from "lucide-react";

export default function LaporanKaderPage() {
  const [activeTab, setActiveTab] = useState<'pws' | 'foto'>('pws');
  const [laporan, setLaporan] = useState<{fotos: any[], pws: any[]}>({ fotos: [], pws: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/laporan-kader');
      setLaporan(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await api.post(`/admin/laporan-kader/${id}/verifikasi`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal memverifikasi laporan");
    }
  };

  const handleExportExcel = () => {
    if (laporan.pws.length === 0) return alert("Belum ada data untuk diekspor");
    
    const headers = ["Bulan", "Tahun", "Posyandu", "Kategori", "Kader", "Data Detail"];
    const rows = laporan.pws.map(p => {
      const dataString = Object.entries(p.data || {}).map(([k, v]) => `${k}:${v}`).join(" | ");
      return [
        p.bulan, 
        p.tahun, 
        p.posyandu?.name || "-", 
        p.kategori_sasaran, 
        p.kader?.name || "-", 
        dataString
      ].map(v => `"${v}"`).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_pws_posyandu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="p-8 pb-24 font-sans text-slate-800 dark:text-slate-200">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Laporan Kader Posyandu</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verifikasi dan Rekapitulasi Data PWS dari 7 Posyandu</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl w-fit mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab('pws')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'pws' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          Rekap PWS Digital
        </button>
        <button
          onClick={() => setActiveTab('foto')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'foto' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          Arsip Foto Register
          {laporan.fotos.filter(f => f.status === 'menunggu_verifikasi').length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
              {laporan.fotos.filter(f => f.status === 'menunggu_verifikasi').length} Baru
            </span>
          )}
        </button>
      </div>

      {/* Content PWS */}
      {activeTab === 'pws' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Data PWS Digital Kader
            </h2>
            <div className="flex gap-3 print:hidden">
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={handlePrintPdf} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto print:p-0">
            {laporan.pws.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-medium">Belum ada data PWS digital.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Bulan</th>
                    <th className="px-6 py-4 font-semibold">Posyandu</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Oleh</th>
                    <th className="px-6 py-4 font-semibold text-left">Data Indikator PWS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {laporan.pws.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 align-top">{p.bulan} {p.tahun}</td>
                      <td className="px-6 py-4 font-semibold text-blue-700 dark:text-blue-400 align-top">{p.posyandu?.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium align-top">{p.kategori_sasaran}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 align-top">{p.kader?.name}</td>
                      <td className="px-6 py-4 align-top max-w-md">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(p.data || {}).map(([key, val]) => (
                            <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <span className="font-black text-slate-800 dark:text-slate-100">{key}:</span> {String(val)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Content Foto */}
      {activeTab === 'foto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laporan.fotos.length === 0 && !loading ? (
             <div className="col-span-full text-center py-16 text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
               Belum ada foto laporan manual yang diunggah.
             </div>
          ) : (
            laporan.fotos.map((f) => (
              <div key={f.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden flex flex-col group">
                <div 
                  className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedFoto(`http://localhost:8000/storage/${f.file_path}`)}
                >
                  <img src={`http://localhost:8000/storage/${f.file_path}`} alt="Laporan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
                  </div>
                  {f.status === 'terverifikasi' && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" /> {f.bulan} {f.tahun}
                    </span>
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-2 py-1 rounded-md">{f.kategori}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{f.posyandu?.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Oleh: {f.kader?.name}</p>
                  
                  {f.catatan && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-300 italic mb-4">
                      "{f.catatan}"
                    </div>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    {f.status === 'menunggu_verifikasi' ? (
                      <button 
                        onClick={() => handleVerify(f.id)}
                        className="w-full bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Verifikasi Arsip
                      </button>
                    ) : (
                      <div className="w-full bg-slate-50 dark:bg-slate-800/50 text-emerald-600 dark:text-emerald-400 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-500/20 border-dashed">
                        Terverifikasi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Image Viewer */}
      {selectedFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedFoto(null)}>
          <button className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => setSelectedFoto(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={selectedFoto} alt="Preview Zoom" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { Image as ImageIcon, FileSpreadsheet, CheckCircle2, Activity, Maximize2, X } from "lucide-react";
import api from "../lib/api";
import { Download, Printer } from "lucide-react";

// --- KAMUS INDIKATOR PWS (Agar tidak disingkat) ---
const PWS_LABELS: Record<string, string> = {
  SASARAN_BAYI: "Sasaran Bayi (0-11 bln)", SASARAN_BALITA_APRAS: "Sasaran Balita (12-71 bln)",
  DATANG_BALITA: "Hadir Balita", DATANG_APRAS: "Hadir Apras", TIDAK_DATANG_BAYI: "Tidak Hadir Bayi", TIDAK_DATANG_APRAS: "Tidak Hadir Apras",
  BBU_SK: "BB/U Sangat Kurang", BBU_K: "BB/U Kurang", BBU_N: "BB/U Normal", BBU_L: "BB/U Lebih",
  PBTBU_SP: "PB/TB/U Sangat Pendek", PBTBU_P: "PB/TB/U Pendek", PBTBU_N: "PB/TB/U Normal", PBTBU_T: "PB/TB/U Tinggi",
  BBPB_GBU: "BB/PB Gizi Buruk", BBPB_GK: "BB/PB Gizi Kurang", BBPB_GB: "BB/PB Gizi Baik", BBPB_BGL: "BB/PB Risiko Gizi Lebih", BBPB_GL: "BB/PB Gizi Lebih", BBPB_OB: "BB/PB Obesitas",
  IMUNISASI_DASAR: "Imunisasi Dasar", VITAMIN_A: "Dapat Vitamin A", OBAT_CACING: "Dapat Obat Cacing",
  SASARAN_BUMIL: "Sasaran Bumil", DATANG_BUMIL: "Bumil Hadir", TIDAK_DATANG: "Tidak Hadir", BB_NAIK: "BB Naik", BB_TIDAK: "BB Tidak Naik",
  LILA_H: "LILA Hijau", LILA_K: "LILA Kuning", LILA_M_KEK: "LILA Merah (KEK)", TD_R: "TD Rendah", TD_N: "TD Normal", TD_T: "TD Tinggi",
  TTD_SETIAP_HARI: "TTD Tiap Hari", TTD_TIDAK: "TTD Tidak Konsumsi", PMT_BUMIL: "Bumil Dapat PMT", BUMIL_KELAS: "Ikut Kelas Bumil", IMUNISASI_TT: "Imunisasi TT", EDUKASI: "Dapat Edukasi",
  SASARAN_6_14: "Sasaran 6-14 Thn", SASARAN_15_18: "Sasaran 15-18 Thn", DATANG_6_14: "Hadir 6-14 Thn", DATANG_15_18: "Hadir 15-18 Thn", TIDAK_DATANG_6_14: "Tidak Hadir 6-14 Thn", TIDAK_DATANG_15_18: "Tidak Hadir 15-18 Thn",
  IMT_SK: "IMT Sangat Kurus", IMT_K: "IMT Kurus", IMT_N: "IMT Normal", IMT_G: "IMT Gemuk", IMT_OB: "IMT Obesitas", LP_P80: "Lingkar Perut >80cm", LP_L90: "Lingkar Perut >90cm",
  TD_RENDAH: "TD Rendah", TD_NORMAL: "TD Normal", TD_TINGGI: "TD Tinggi", GD_RENDAH: "Gula Darah Rendah", GD_NORMAL: "Gula Darah Normal", GD_TINGGI: "Gula Darah Tinggi",
  SASARAN_DEWASA: "Sasaran Dewasa", DATANG_DEWASA: "Dewasa Hadir", LP_PEMERIKSAAN: "Diperiksa Lingkar Perut", EDUKASI_CERDIK: "Edukasi CERDIK", EDUKASI_KB: "Edukasi KB", EDUKASI_PTM: "Edukasi PTM", DIRUJUK: "Dirujuk ke Faskes",
  SASARAN_BUSUI: "Sasaran Ibu Menyusui", DATANG_BUSUI: "Busui Hadir", LILA_NORMAL: "LILA Normal", LILA_KEK: "LILA KEK", ASI_EKSKLUSIF: "ASI Eksklusif", ASI_LANJUTAN: "ASI Lanjutan", TIDAK_ASI: "Tidak Menyusui",
  SASARAN_LANSIA: "Sasaran Lansia", DATANG_LANSIA: "Lansia Hadir", EDUKASI_GERMAS: "Edukasi GERMAS", EDUKASI_GIZI: "Edukasi Gizi", EDUKASI_JATUH: "Edukasi Pencegahan Jatuh",
  KONSELING_LAKTASI: "Konseling Laktasi", PMT_BUSUI: "Dapat PMT Busui"
};

function formatPwsKey(key: string): string {
  if (PWS_LABELS[key]) return PWS_LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const API_BASE_URL = 'https://posyandu-tubanan-api-production-6ff3.up.railway.app';

export default function LaporanKaderPage() {
  const [activeTab, setActiveTab] = useState<'pws' | 'foto'>('pws');
  const [laporan, setLaporan] = useState<{fotos: any[], pws: any[]}>({ fotos: [], pws: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [selectedPwsData, setSelectedPwsData] = useState<{title: string, data: any} | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/admin/laporan-kader');
      setLaporan(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFoto = async (id: number, status: 'terverifikasi' | 'ditolak') => {
    try {
      await api.put(`/admin/laporan-kader/foto/${id}/verifikasi`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal memverifikasi foto laporan");
    }
  };

  const handleVerifyPws = async (id: number, status: 'terverifikasi' | 'ditolak') => {
    try {
      await api.put(`/admin/laporan-kader/pws/${id}/verifikasi`, { status });
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal memverifikasi laporan PWS");
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
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs">Bulan</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs hidden sm:table-cell">Posyandu</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs">Kategori</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs hidden md:table-cell">Oleh</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs hidden lg:table-cell text-left">Data Indikator PWS</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {laporan.pws.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-slate-800 dark:text-slate-200 align-top text-xs sm:text-sm">{p.tanggal ? `${p.tanggal} ` : ''}{p.bulan} {p.tahun}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-blue-700 dark:text-blue-400 align-top text-xs sm:text-sm hidden sm:table-cell">{p.posyandu?.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-600 dark:text-slate-400 font-medium align-top text-xs sm:text-sm">{p.kategori_sasaran}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-500 dark:text-slate-400 align-top text-xs sm:text-sm hidden md:table-cell">{p.kader?.name}</td>
                      <td className="px-6 py-4 align-top">
                        <button 
                          onClick={() => setSelectedPwsData({
                            title: `${p.kategori_sasaran} - ${p.posyandu?.name} (${p.bulan} ${p.tahun})`, 
                            data: p.data 
                          })}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          Lihat {Object.keys(p.data || {}).length} Indikator
                        </button>
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        {p.status === 'terverifikasi' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                          </div>
                        ) : p.status === 'ditolak' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold">
                            <X className="w-3.5 h-3.5" /> Ditolak
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleVerifyPws(p.id, 'terverifikasi')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 text-xs font-bold transition-colors shadow-sm"
                              title="Terima Laporan"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Terima
                            </button>
                            <button 
                              onClick={() => handleVerifyPws(p.id, 'ditolak')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-400 text-xs font-bold transition-colors shadow-sm"
                              title="Tolak Laporan"
                            >
                              <X className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        )}
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
                  onClick={() => setSelectedFoto(`${API_BASE_URL}/storage/${f.file_path}`)}
                >
                  <img src={`${API_BASE_URL}/storage/${f.file_path}`} alt="Laporan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 items-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-bold ring-1 ring-inset ring-violet-600/20">
                        Foto Manual
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-2 py-1 rounded-md">{f.kategori}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{f.tanggal ? `${f.tanggal} ` : ''}{f.bulan} {f.tahun}</span>
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
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVerifyFoto(f.id, 'terverifikasi')}
                          className="flex-1 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Terima
                        </button>
                        <button 
                          onClick={() => handleVerifyFoto(f.id, 'ditolak')}
                          className="flex-1 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-400 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <X className="w-4 h-4" /> Tolak
                        </button>
                      </div>
                    ) : f.status === 'ditolak' ? (
                      <div className="w-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-500/20 border-dashed">
                        Ditolak
                      </div>
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

      {/* Modal PWS Data Viewer */}
      {selectedPwsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={(e) => { if(e.target === e.currentTarget) setSelectedPwsData(null) }}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                {selectedPwsData.title}
              </h3>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-full transition-colors shadow-sm" onClick={() => setSelectedPwsData(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedPwsData.data || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                      {formatPwsKey(key)}
                    </span>
                    <span className="font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg text-base">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
              <button onClick={() => setSelectedPwsData(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

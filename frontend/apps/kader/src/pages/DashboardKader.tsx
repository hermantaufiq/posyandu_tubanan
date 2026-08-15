import { useState, useEffect } from "react";
import { LogOut, FileSpreadsheet, Camera, CheckCircle2, AlertTriangle, ArrowRight, Sun, Moon, Download, Printer, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useTheme } from "../components/ThemeContext";

export default function DashboardKader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any>({ fotos: [], pws: [] });
  const { theme, toggleTheme } = useTheme();

  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  useEffect(() => {
    const usr = localStorage.getItem("kader_auth_user");
    if (!usr) {
      navigate("/login");
    } else {
      // Tampilkan dashboard LANGSUNG dari localStorage (tidak menunggu API)
      setUser(JSON.parse(usr));
      
      // Muat riwayat di latar belakang (tidak memblokir tampilan)
      setLoadingRiwayat(true);
      api.get("/kader/laporan/riwayat")
        .then(res => setRiwayat(res.data))
        .catch(console.error)
        .finally(() => setLoadingRiwayat(false));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("kader_auth_token");
    localStorage.removeItem("kader_auth_user");
    navigate("/login");
  };

  const handleExportExcel = () => {
    if (!riwayat.pws || riwayat.pws.length === 0) return alert("Belum ada data PWS untuk diekspor");
    
    const headers = ["Tanggal Kirim", "Bulan", "Tahun", "Kategori", "Data Detail"];
    const rows = riwayat.pws.map((p: any) => {
      const dataString = Object.entries(p.data || {}).map(([k, v]) => `${k}:${v}`).join(" | ");
      const tgl = new Date(p.created_at).toLocaleDateString('id-ID');
      return [
        tgl,
        p.bulan, 
        p.tahun, 
        p.kategori_sasaran, 
        dataString
      ].map(v => `"${v}"`).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_pws_kader.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SIPO Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">SIPO-Terpadu Tubanan</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {user?.name} &bull; {user?.posyandu?.name ?? "Posyandu Tubanan"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-semibold text-sm transition-colors px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl">
            Keluar <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
        
        {/* Banner Sapaan */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200/50 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Bertugas, Kader Hebat!</h2>
            <p className="text-emerald-50 max-w-xl">Pilih cara pelaporan yang paling mudah untuk Anda. Isi rekap PWS secara digital, atau cukup foto buku register manual Anda dan kirimkan ke Admin.</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 text-center min-w-[150px]">
            <p className="text-4xl font-black">
              {loadingRiwayat ? "..." : (riwayat.fotos?.length || 0) + (riwayat.pws?.length || 0)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-50 mt-1">Laporan Terkirim</p>
          </div>
        </div>

        {/* Navigator Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 0: Pelaksanaan Posyandu */}
          <Link to="/pelaksanaan" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-xl shadow-sm">Utama</div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pelaksanaan Hari Ini</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3">Buka pendaftaran, scan barcode warga, dan input pengukuran awal (Meja 1 & 2).</p>
            <div className="mt-auto flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-sm">
              <span>Mulai Posyandu</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Card: Cetak Barcode */}
          <Link to="/cetak-barcode" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Printer className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Cetak Stiker Barcode</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3">Cetak kode QR warga secara massal untuk ditempel ke Buku KIA / KMS.</p>
            <div className="mt-auto flex items-center justify-between text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              <span>Cetak Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Card 1: PWS Digital */}
          <Link to="/laporan-pws" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Laporan PWS Digital</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3">Isi angka rekapitulasi PWS langsung ke sistem untuk direkap Admin.</p>
            <div className="mt-auto flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <span>Isi Laporan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Upload Foto Manual */}
          <Link to="/upload-foto" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-xl hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 bg-amber-400 dark:bg-amber-500 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-xl">Alternatif</div>
            
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Upload Foto Register</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3">Foto lembar buku register manual Anda dan kirimkan ke admin jika tidak sempat.</p>
            <div className="mt-auto flex items-center justify-between text-violet-600 dark:text-violet-400 font-bold text-sm">
              <span>Upload Foto</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Riwayat Singkat */}
        <div className="mt-12 print:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">Riwayat Laporan Anda</h3>
            <div className="flex gap-2 print:hidden">
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                <Download className="w-3.5 h-3.5" /> Unduh Excel
              </button>
              <button onClick={handlePrintPdf} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                <Printer className="w-3.5 h-3.5" /> Cetak PDF
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none">
            {riwayat.fotos?.length === 0 && riwayat.pws?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">Belum ada laporan yang dikirimkan.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Tanggal Kirim</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Bulan Laporan</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Jenis</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Kategori Sasaran</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {riwayat.fotos?.map((f: any) => (
                    <tr key={`f-${f.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(f.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{f.bulan} {f.tahun}</td>
                      <td className="px-6 py-4"><span className="bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 px-2 py-1 rounded-md text-xs font-bold print:border print:border-violet-700 print:bg-transparent">Foto Manual</span></td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{f.kategori}</td>
                      <td className="px-6 py-4 text-right">
                        {f.status === 'terverifikasi' 
                          ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs"><CheckCircle2 className="w-4 h-4"/> Diterima</span>
                          : <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs"><AlertTriangle className="w-4 h-4"/> Menunggu</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {riwayat.pws?.map((p: any) => (
                    <tr key={`p-${p.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{p.bulan} {p.tahun}</td>
                      <td className="px-6 py-4"><span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-bold print:border print:border-blue-700 print:bg-transparent">PWS Digital</span></td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.kategori_sasaran}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs"><CheckCircle2 className="w-4 h-4"/> Otomatis Rekap</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

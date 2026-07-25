import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Search, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../lib/api";

export default function CetakBarcodePage() {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchWarga();
  }, [debouncedSearch]);

  const fetchWarga = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kader/warga?search=${debouncedSearch}`);
      if (res.data.success) {
        setWarga(res.data.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === warga.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = warga.map(w => w.id);
      setSelectedIds(new Set(allIds));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const wargaToPrint = warga.filter(w => selectedIds.has(w.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      
      {/* HEADER HIDDEN PADA SAAT PRINT */}
      <header className="print:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Cetak Barcode KIA</h1>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Pilih Warga untuk Dicetak</p>
          </div>
        </div>
        
        <button 
          onClick={handlePrint}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Printer className="w-4 h-4" /> Cetak ({selectedIds.size})
        </button>
      </header>

      {/* KONTEN UTAMA - HIDDEN SAAT PRINT */}
      <main className="print:hidden max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full sm:w-96 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari NIK atau Nama..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            
            <button onClick={toggleSelectAll} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 w-full sm:w-auto text-right">
              {selectedIds.size === warga.length && warga.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {warga.map(w => (
                <div 
                  key={w.id} 
                  onClick={() => toggleSelect(w.id)}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex items-start gap-4 ${
                    selectedIds.has(w.id) 
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    selectedIds.has(w.id) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 dark:border-slate-600 dark:bg-slate-800'
                  }`}>
                    {selectedIds.has(w.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{w.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{w.nik}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {w.kategori_warga}
                    </span>
                  </div>
                </div>
              ))}
              
              {warga.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 font-medium">
                  Tidak ada data warga ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AREA CETAK - HANYA MUNCUL SAAT PRINT */}
      <div className="hidden print:block p-8">
        <h2 className="text-xl font-bold text-center mb-8">STIKER BARCODE KIA POSYANDU</h2>
        <div className="grid grid-cols-4 gap-x-8 gap-y-12">
          {wargaToPrint.map(w => (
            <div key={w.id} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-4 rounded-xl">
              <QRCodeSVG 
                value={w.nik} 
                size={120} 
                level="M" 
                includeMargin={false} 
              />
              <div className="text-center mt-3 w-full">
                <p className="font-bold text-xs truncate uppercase">{w.name}</p>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{w.nik}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

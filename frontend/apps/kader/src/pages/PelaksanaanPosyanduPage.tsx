import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ScanLine, Search, UserPlus, Users, Loader2, CheckCircle2, Scale, AlertTriangle } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import api from "../lib/api";

export default function PelaksanaanPosyanduPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'cari' | 'baru'>('cari');
  const [jadwalAktif, setJadwalAktif] = useState<any>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // New Citizen state
  const [newCitizen, setNewCitizen] = useState({
    nik: "", name: "", jenis_layanan: "Balita dan Anak Prasekolah", date_of_birth: "", address: ""
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Antrian Hari ini
  const [antrian, setAntrian] = useState<any[]>([]);

  const fetchJadwalAndAntrian = async () => {
    try {
      const resJadwal = await api.get('/kader/jadwal/aktif');
      if (resJadwal.data.data && resJadwal.data.data.length > 0) {
        const j = resJadwal.data.data[0];
        setJadwalAktif(j);
        
        const resAntrian = await api.get(`/kader/antrian?jadwal_id=${j.id}`);
        setAntrian(resAntrian.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJadwalAndAntrian();
  }, []);

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const query = overrideQuery ?? searchQuery;
    if (!query || query.length < 3) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/kader/warga`, { params: { search: query } });
      // The backend returns paginated data (res.data.data.data)
      setSearchResults(res.data.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalAktif) return alert("Tidak ada jadwal posyandu aktif hari ini");
    setIsRegistering(true);
    try {
      await api.post('/kader/antrian/walk-in', {
        ...newCitizen,
        jadwal_id: jadwalAktif.id
      });
      setSuccessMessage(`${newCitizen.name} berhasil didaftarkan dan masuk antrian!`);
      setNewCitizen({ nik: "", name: "", jenis_layanan: "Balita dan Anak Prasekolah", date_of_birth: "", address: "" });
      fetchJadwalAndAntrian();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      alert("Gagal mendaftar: " + (err.response?.data?.message || err.message));
    } finally {
      setIsRegistering(false);
    }
  };

  const tandaiHadir = async (antrian_id: number) => {
    try {
      await api.post('/kader/antrian/hadir', { antrian_id });
      fetchJadwalAndAntrian();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm dark:shadow-none flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Pelaksanaan Posyandu</h1>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Meja 1 (Pendaftaran) & Meja 2 (Pengukuran)</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        
        {!jadwalAktif ? (
          <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl border border-amber-200 flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="font-bold text-lg">Belum Ada Jadwal Posyandu Aktif</h3>
            <p className="text-sm">Silakan hubungi Bidan/Admin untuk membuka jadwal Posyandu hari ini.</p>
          </div>
        ) : (
          <>
            {/* Banner Jadwal */}
            <div className="bg-emerald-600 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-emerald-200/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">SEDANG BERLANGSUNG</span>
                <span className="text-emerald-100 text-sm">{jadwalAktif.tanggal}</span>
              </div>
              <h2 className="text-2xl font-black mb-1">{jadwalAktif.posyandu?.name}</h2>
              <p className="text-emerald-100 opacity-90">{jadwalAktif.lokasi}</p>
            </div>

            {/* TABS */}
            <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-6 flex-wrap sm:flex-nowrap">
              <button onClick={() => setActiveTab('cari')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'cari' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Search className="w-4 h-4" /> Cari Manual (Buku KIA)
              </button>
              <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'scan' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <ScanLine className="w-4 h-4" /> Scan Barcode (HP)
              </button>
              <button onClick={() => setActiveTab('baru')} className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'baru' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <UserPlus className="w-4 h-4" /> Warga Baru
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
              
              {activeTab === 'cari' && (
                <div>
                  <h3 className="font-black text-lg mb-2 text-slate-800 dark:text-slate-100">Cari Warga (Tanpa HP)</h3>
                  <p className="text-sm text-slate-500 mb-6">Gunakan fitur ini jika warga hanya membawa Buku KIA/KMS fisik. Ketikkan Nama atau NIK warga.</p>
                  
                  <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                    <input 
                      type="text" 
                      placeholder="Masukkan Nama atau NIK..." 
                      className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" disabled={isSearching} className="bg-slate-800 text-white px-6 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center min-w-[120px]">
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cari Data'}
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {searchResults.map((w) => (
                        <div key={w.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{w.name}</p>
                            <p className="text-xs text-slate-500">NIK: {w.nik} &bull; {w.kategori_warga}</p>
                          </div>
                          <button onClick={() => {
                            setNewCitizen({...newCitizen, nik: w.nik, name: w.name, jenis_layanan: w.kategori_warga || "Balita dan Anak Prasekolah"});
                            setActiveTab('baru'); // Redirect to register to put in antrian
                          }} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">
                            Masukkan Antrian
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.length === 0 && searchQuery.length > 3 && !isSearching && (
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 text-sm border border-slate-200 dark:border-slate-700">
                      Data warga tidak ditemukan. Silakan gunakan menu "Warga Baru".
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'scan' && (
                <div className="text-center py-4 sm:py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                    <ScanLine className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-xl mb-2 text-slate-800 dark:text-slate-100">Scanner Barcode NIK</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Arahkan kamera ke stiker Barcode di Buku KIA atau HP Warga.</p>
                  
                  <div className="max-w-sm mx-auto overflow-hidden rounded-3xl border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-black relative">
                    <Scanner
                      onScan={(result) => {
                        if (result && result.length > 0) {
                          let text = result[0].rawValue;
                          if (text && text.length > 3) {
                            // Parse JSON barcode dari portal masyarakat
                            // Format: {"app":"POSYANDU-TUBANAN","nik":"...","nama":"..."}
                            try {
                              const parsed = JSON.parse(text);
                              if (parsed.app === 'POSYANDU-TUBANAN') {
                                // NIK dan nama ada di level atas, bukan di dalam "user"
                                text = parsed.nik || parsed.nama || text;
                              }
                            } catch (e) {
                              // Bukan JSON — pakai text apa adanya (NIK langsung dari stiker)
                            }
                            
                            setSearchQuery(text);
                            setActiveTab('cari');
                            // Langsung search dengan text yang sudah di-extract
                            // (tidak pakai state agar terhindar dari stale closure)
                            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                            handleSearch(fakeEvent, text);
                          }
                        }
                      }}
                      onError={(error) => console.log("Scanner Error:", error?.message)}
                    />
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 animate-pulse">Menunggu Barcode...</p>
                </div>
              )}

              {activeTab === 'baru' && (
                <div>
                  <h3 className="font-black text-lg mb-2 text-slate-800 dark:text-slate-100">Daftarkan Warga Baru / Manual</h3>
                  <p className="text-sm text-slate-500 mb-6">Warga belum terdaftar di sistem? Masukkan data dasarnya di sini agar langsung bisa ditimbang hari ini.</p>
                  
                  {successMessage && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 flex items-center gap-3 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {successMessage}
                    </div>
                  )}

                  <form onSubmit={handleRegisterNew} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">NIK Warga (16 Digit)</label>
                        <input type="text" required maxLength={16} minLength={16} value={newCitizen.nik} onChange={e=>setNewCitizen({...newCitizen, nik: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" placeholder="Ketik NIK..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Nama Lengkap</label>
                        <input type="text" required value={newCitizen.name} onChange={e=>setNewCitizen({...newCitizen, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" placeholder="Ketik Nama..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Kategori / Sasaran</label>
                        <select value={newCitizen.jenis_layanan} onChange={e=>setNewCitizen({...newCitizen, jenis_layanan: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500">
                          <option value="Balita dan Anak Prasekolah">Balita dan Anak Prasekolah (0-59 bln)</option>
                          <option value="Ibu Hamil">Ibu Hamil</option>
                          <option value="Ibu Nifas dan Menyusui">Ibu Nifas dan Menyusui</option>
                          <option value="Anak Usia Sekolah dan Remaja">Anak Usia Sekolah dan Remaja (6-18 th)</option>
                          <option value="Usia Produktif">Usia Dewasa (19-59 th)</option>
                          <option value="Lansia">Lansia (≥60 th)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Tanggal Lahir (Opsional)</label>
                        <input type="date" value={newCitizen.date_of_birth} onChange={e=>setNewCitizen({...newCitizen, date_of_birth: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                    <button type="submit" disabled={isRegistering} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 mt-4 transition-colors">
                      {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Daftarkan & Masukkan Antrian</>}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* DAFTAR ANTRIAN HARI INI */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Daftar Hadir / Antrian Hari Ini
                </h3>
                <p className="text-sm text-slate-500">Warga yang sudah scan barcode atau didaftarkan manual akan muncul di sini.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {antrian.map((a: any) => (
                <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2 py-0.5 rounded uppercase border border-emerald-200">No. {a.nomor_antri}</span>
                        {a.status === 'menunggu' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">Baru Daftar</span>}
                        {a.status === 'hadir' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">Menunggu Timbang</span>}
                        {a.status === 'tunggu_bidan' && <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded border border-violet-200">Tunggu Bidan</span>}
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{a.user?.name || 'Anonim'}</h4>
                      <p className="text-xs text-slate-500">{a.jenis_layanan}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    {a.status === 'menunggu' && (
                      <button onClick={() => tandaiHadir(a.id)} className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors">
                        Tandai Hadir
                      </button>
                    )}
                    {(a.status === 'menunggu' || a.status === 'hadir') && (
                      <Link to={`/input-pemeriksaan/${a.id}`} className="flex-1 bg-slate-800 dark:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                        <Scale className="w-4 h-4" /> Input Pemeriksaan
                      </Link>
                    )}
                    {a.status === 'tunggu_bidan' && (
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Selesai Diukur
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {antrian.length === 0 && (
                <div className="col-span-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada warga yang hadir atau mendaftar hari ini.</p>
                </div>
              )}
            </div>
            
          </>
        )}
      </main>
    </div>
  );
}

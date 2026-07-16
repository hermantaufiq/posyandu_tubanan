import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Search, HeartHandshake, CheckCircle2, Users, CameraOff, ChevronRight, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

// ─── Pengukuran Modal (Kader) ────────────────────────────────────────────────
function PengukuranModal({
  antrian, onClose, onDone,
}: {
  antrian: any; onClose: () => void; onDone: () => void;
}) {
  const [form, setForm] = useState({ berat_badan: '', tinggi_badan: '' });
  const [loading, setLoading] = useState(false);
  const isLansia = antrian.jenis_layanan === 'Lansia';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Kader hanya menyimpan berat dan tinggi, status menjadi 'tunggu_bidan'
      await api.post('/nakes/pemeriksaan-kader', { antrian_id: antrian.id, ...form });
      onDone();
    } catch {
      alert('Gagal menyimpan pengukuran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md"
      >
        <div className="p-6 border-b border-slate-100 bg-pink-50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-pink-600 mb-1">
            <Scale className="w-5 h-5" />
            <h3 className="text-lg font-bold">Meja Pengukuran (Kader)</h3>
          </div>
          <p className="text-sm text-slate-600">{antrian.user?.name} • Antrian {antrian.nomor_antri}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
              <input type="number" step="0.1" placeholder={isLansia ? "Misal: 55" : "Misal: 10.5"} value={form.berat_badan}
                onChange={e => setForm({ ...form, berat_badan: e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
              <input type="number" step="0.1" placeholder={isLansia ? "Misal: 160" : "Misal: 85"} value={form.tinggi_badan}
                onChange={e => setForm({ ...form, tinggi_badan: e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-sm transition-all" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Lanjut ke Bidan'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Dashboard Kader ─────────────────────────────────────────────────────────
export default function DashboardKader() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'ktp'>('scanner');
  const [antrians, setAntrians] = useState<any[]>([]);
  const [nik, setNik] = useState('');
  const [isLoadingKtp, setIsLoadingKtp] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedAntrian, setSelectedAntrian] = useState<any>(null);
  const html5QrRef = useRef<Html5Qrcode | null>(null);

  const jadwalId = 1;

  useEffect(() => {
    fetchAntrian();
    const interval = setInterval(fetchAntrian, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAntrian = async () => {
    try {
      const res = await api.get(`/nakes/antrian?jadwal_id=${jadwalId}`);
      setAntrians(res.data.data ?? []);
    } catch { /* silent */ }
  };

  const startScanner = async () => {
    if (scanning) return;
    try {
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          await scanner.stop();
          setScanning(false);
          handleScanQr(text);
        },
        () => {}
      );
    } catch {
      setMessage({ type: 'error', text: 'Kamera tidak dapat diakses.' });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  useEffect(() => {
    if (activeTab !== 'scanner') stopScanner();
    setMessage(null);
  }, [activeTab]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleScanQr = async (payload: string) => {
    setMessage(null);
    try {
      const res = await api.post('/nakes/scan-qr', { qr_payload: payload, jadwal_id: jadwalId });
      showMessage('success', res.data.message);
      fetchAntrian();
    } catch (err: any) {
      showMessage('error', err.response?.data?.message ?? 'QR tidak valid.');
    }
  };

  const handleInputKtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nik.length !== 16) {
      showMessage('error', 'NIK harus 16 digit.');
      return;
    }
    setIsLoadingKtp(true);
    setMessage(null);
    try {
      const res = await api.post('/nakes/input-ktp', { nik, jadwal_id: jadwalId });
      showMessage('success', res.data.message);
      setNik('');
      fetchAntrian();
    } catch (err: any) {
      showMessage('error', err.response?.data?.message ?? 'KTP tidak ditemukan.');
    } finally {
      setIsLoadingKtp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-none">Portal Kader Posyandu</h1>
            <p className="text-xs text-slate-500 mt-0.5">Meja 1 (Pendaftaran) & Meja 2 (Pengukuran)</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* ── Left: Pendaftaran Panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-pink-50 p-1 rounded-xl flex gap-1 border border-pink-100">
              <button onClick={() => setActiveTab('scanner')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'scanner' ? 'bg-white shadow-sm text-pink-700' : 'text-pink-600/70 hover:text-pink-700'}`}>
                <QrCode className="w-4 h-4" /> Scan QR
              </button>
              <button onClick={() => setActiveTab('ktp')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'ktp' ? 'bg-white shadow-sm text-pink-700' : 'text-pink-600/70 hover:text-pink-700'}`}>
                <Search className="w-4 h-4" /> Input KTP
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'scanner' && (
                <motion.div key="scanner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div>
                    <h2 className="font-bold text-slate-800">Meja 1: Scan Kehadiran</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Arahkan kamera ke QR warga.</p>
                  </div>
                  <div className={`relative overflow-hidden rounded-xl border-2 transition-colors ${scanning ? 'border-pink-400' : 'border-dashed border-slate-300'}`} style={{ minHeight: 240 }}>
                    <div id="qr-reader" className="w-full" />
                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center">
                          <CameraOff className="w-7 h-7 text-pink-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  {scanning ? (
                    <button onClick={stopScanner} className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50">
                      Hentikan Kamera
                    </button>
                  ) : (
                    <button onClick={startScanner} className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" /> Aktifkan Kamera Scanner
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'ktp' && (
                <motion.div key="ktp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div>
                    <h2 className="font-bold text-slate-800">Meja 1: Cek KTP Lansia</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Masukkan 16 digit NIK dari KTP warga Lansia.</p>
                  </div>
                  <form onSubmit={handleInputKtp} className="space-y-4">
                    <input
                      type="text" inputMode="numeric" autoFocus
                      value={nik}
                      onChange={e => setNik(e.target.value.replace(/\D/g, '').substring(0, 16))}
                      placeholder="3320 XXXX XXXX XXXX"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none font-mono text-lg tracking-widest text-center"
                    />
                    <button type="submit" disabled={isLoadingKtp || nik.length !== 16}
                      className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm">
                      Catat Kehadiran
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Feedback */}
            {message && (
              <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                <CheckCircle2 className="w-5 h-5" /> {message.text}
              </div>
            )}
          </div>

          {/* ── Right: Antrian Pendaftaran & Pengukuran ── */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-bold text-slate-800">Daftar Warga yang Hadir</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {antrians.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Belum ada warga yang hadir</p>
                  </div>
                ) : antrians.map((a) => (
                  <div key={a.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-lg">
                      {String(a.nomor_antri).split('-')[1] || a.nomor_antri}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{a.user?.name}</p>
                      <p className="text-xs text-slate-500">{a.jenis_layanan}</p>
                    </div>

                    {a.status === 'menunggu' && (
                       <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-full font-bold">Belum Hadir</span>
                    )}
                    {a.status === 'diperiksa' && (
                      <button onClick={() => setSelectedAntrian(a)} className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                        Ukur BB/TB <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                    {(a.status === 'tunggu_bidan' || a.status === 'selesai') && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sudah Diukur
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedAntrian && (
        <PengukuranModal
          antrian={selectedAntrian}
          onClose={() => setSelectedAntrian(null)}
          onDone={() => {
            setSelectedAntrian(null);
            fetchAntrian();
            showMessage('success', 'Pengukuran tersimpan! Warga diarahkan ke Meja Bidan.');
          }}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  CheckCircle2, Clock, Users, Stethoscope,
  ChevronRight, ClipboardList, Heart, AlertCircle, Syringe,
  TrendingUp, Baby, UserCheck, TrendingDown, Minus, History, TriangleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

// ─── Riwayat Kunjungan Panel ──────────────────────────────────────────────────
function RiwayatPanel({ riwayat, currentBB }: { riwayat: any[]; currentBB?: number }) {
  if (!riwayat || riwayat.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <History className="w-6 h-6 text-slate-300 mx-auto mb-1" />
        <p className="text-xs text-slate-400 font-medium">Belum ada riwayat kunjungan sebelumnya</p>
      </div>
    );
  }

  const lastVisit  = riwayat[0];
  const lastBB     = parseFloat(lastVisit.berat_badan ?? 0);
  const bbDiff     = currentBB ? (currentBB - lastBB) : null;
  const isNaik     = bbDiff !== null && bbDiff > 0.05;
  const isTurun    = bbDiff !== null && bbDiff < -0.05;
  const isTetap    = bbDiff !== null && !isNaik && !isTurun;

  return (
    <div className="space-y-3">
      {/* BB Trend Warning */}
      {isTurun && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
          <TriangleAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700 font-semibold">
            ⚠️ Berat badan turun <strong>{Math.abs(bbDiff!).toFixed(1)} kg</strong> dari kunjungan terakhir!
            Perlu evaluasi lebih lanjut.
          </p>
        </div>
      )}

      {/* Riwayat Timeline */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {riwayat.map((r: any, i: number) => {
          const tanggal = new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
          return (
            <div key={r.id} className={`px-4 py-3 flex items-center gap-3 ${i === 0 ? 'bg-blue-50/50' : 'bg-white'}`}>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-600 flex-shrink-0">
                {riwayat.length - i}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">{tanggal}</p>
                <div className="flex flex-wrap gap-2 mt-0.5">
                  {r.berat_badan && <span className="text-xs font-bold text-slate-700">BB: {r.berat_badan} kg</span>}
                  {r.tinggi_badan && <span className="text-xs font-bold text-slate-700">TB: {r.tinggi_badan} cm</span>}
                  {r.status_gizi && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      r.status_gizi === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                      r.status_gizi === 'Kurang' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.status_gizi}</span>
                  )}
                  {r.imunisasi && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">💉 {r.imunisasi}</span>}
                  {r.vitamin && <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-1.5 py-0.5 rounded-full">💊 {r.vitamin}</span>}
                </div>
              </div>
              {/* BB trend arrow vs previous */}
              {i === 0 && bbDiff !== null && (
                <div className={`flex items-center gap-0.5 text-xs font-black flex-shrink-0 ${
                  isNaik ? 'text-emerald-600' : isTurun ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {isNaik && <TrendingUp className="w-4 h-4" />}
                  {isTurun && <TrendingDown className="w-4 h-4" />}
                  {isTetap && <Minus className="w-4 h-4" />}
                  {bbDiff !== null && <span>{bbDiff > 0 ? '+' : ''}{bbDiff.toFixed(1)}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helper: Status Antrian Badge ────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    menunggu:     { label: 'Menunggu Kader',  cls: 'bg-slate-100 text-slate-500' },
    diperiksa:    { label: 'Hadir',           cls: 'bg-amber-100 text-amber-700' },
    tunggu_bidan: { label: 'Tunggu Bidan',    cls: 'bg-blue-100 text-blue-700 animate-pulse' },
    selesai:      { label: 'Selesai',         cls: 'bg-emerald-100 text-emerald-700' },
    batal:        { label: 'Batal',           cls: 'bg-red-100 text-red-500' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={`${s.cls} text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

// ─── Pemeriksaan Modal (Bidan - Full Medical) ─────────────────────────────────
function PemeriksaanModal({
  antrian, onClose, onDone,
}: {
  antrian: any; onClose: () => void; onDone: () => void;
}) {
  const isLansia   = antrian.jenis_layanan === 'Lansia';
  const isIbuHamil = antrian.jenis_layanan === 'Ibu Hamil';
  const isIbuNifas = antrian.jenis_layanan?.includes('Nifas');
  const isBalita   = antrian.jenis_layanan?.includes('Prasekolah');
  const isRemaja   = antrian.jenis_layanan?.includes('Remaja') || antrian.jenis_layanan?.includes('Sekolah');
  const riwayat  = antrian.riwayat ?? [];

  const [activeTab, setActiveTab] = useState<'periksa' | 'riwayat'>(
    riwayat.length > 0 ? 'riwayat' : 'periksa'
  );
  const [form, setForm] = useState({
    berat_badan:    antrian.pemeriksaan?.berat_badan    ?? '',
    tinggi_badan:   antrian.pemeriksaan?.tinggi_badan   ?? '',
    lingkar_kepala: antrian.pemeriksaan?.lingkar_kepala ?? '',
    tensi:          '',
    gula_darah:     '',
    status_gizi:    'Normal',
    imunisasi:      '',
    vitamin:        '',
    catatan:        '',
    dirujuk:        false,
    alasan_rujukan: '',
    usia_kandungan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/nakes/pemeriksaan', { antrian_id: antrian.id, ...form });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm transition-all bg-white';
  const labelCls = 'block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5" />
                <span className="text-sm font-semibold opacity-90">Pemeriksaan Medis Bidan</span>
              </div>
              <h3 className="text-xl font-black">{antrian.user?.name}</h3>
              <p className="text-sm opacity-80 mt-0.5">
                No. Antri {antrian.nomor_antri} • {antrian.jenis_layanan ?? 'Anak Prasekolah'}

              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              isLansia ? 'bg-purple-500/30 text-purple-100' :
              isIbuHamil ? 'bg-pink-500/30 text-pink-100' :
              isIbuNifas ? 'bg-rose-500/30 text-rose-100' :
              'bg-emerald-500/30 text-emerald-100'
            }`}>
              {isLansia ? '👴 Lansia' : isIbuHamil ? '🤰 Ibu Hamil' : isIbuNifas ? '🤱 Ibu Nifas & Menyusui' : isBalita ? '👶 Balita & Prasekolah' : isRemaja ? '🎒 Usia Sekolah & Remaja' : '🧑 Usia Produktif'}
            </div>
          </div>
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
            <button type="button" onClick={() => setActiveTab('riwayat')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'riwayat' ? 'bg-white text-blue-700' : 'text-white/70 hover:text-white'}`}>
              <History className="w-3.5 h-3.5" />
              Riwayat Kunjungan
              {riwayat.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === 'riwayat' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}`}>{riwayat.length}</span>}
            </button>
            <button type="button" onClick={() => setActiveTab('periksa')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'periksa' ? 'bg-white text-blue-700' : 'text-white/70 hover:text-white'}`}>
              <Stethoscope className="w-3.5 h-3.5" />
              Periksa Sekarang
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'riwayat' ? (
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" /> Riwayat Kunjungan Sebelumnya
              </h4>
              <button type="button" onClick={() => setActiveTab('periksa')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Periksa Sekarang <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <RiwayatPanel riwayat={riwayat} currentBB={parseFloat(form.berat_badan) || undefined} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">

            {/* Pengukuran Fisik (dari Kader atau diisi Bidan) */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-bold text-slate-700">Data Antropometri</h4>
                {(antrian.pemeriksaan?.berat_badan || antrian.pemeriksaan?.tinggi_badan) && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✓ Data dari Kader</span>
                )}
              </div>
              <div className={`grid gap-4 ${isLansia ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <div>
                  <label className={labelCls}>Berat Badan (kg)</label>
                  <input type="number" step="0.1" placeholder="cth: 12.5" value={form.berat_badan} onChange={e => set('berat_badan', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tinggi Badan (cm)</label>
                  <input type="number" step="0.1" placeholder="cth: 89" value={form.tinggi_badan} onChange={e => set('tinggi_badan', e.target.value)} className={inputCls} />
                </div>
                {!isLansia && !isIbuHamil && !isIbuNifas && (
                  <div>
                    <label className={labelCls}>Lingkar Kepala (cm)</label>
                    <input type="number" step="0.1" placeholder="cth: 48.5" value={form.lingkar_kepala} onChange={e => set('lingkar_kepala', e.target.value)} className={inputCls} />
                  </div>
                )}
                {isIbuHamil && (
                  <div>
                    <label className={labelCls}>Usia Kandungan</label>
                    <input type="text" placeholder="cth: 24 Minggu" value={form.usia_kandungan} onChange={e => set('usia_kandungan', e.target.value)} className={inputCls} />
                  </div>
                )}
              </div>
            </div>

            {/* Pemeriksaan Klinis */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Heart className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-bold text-slate-700">Pemeriksaan Klinis</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {!isBalita && (
                  <>
                    <div>
                      <label className={labelCls}>Tekanan Darah (mmHg)</label>
                      <input type="text" placeholder="cth: 120/80" value={form.tensi} onChange={e => set('tensi', e.target.value)} className={inputCls} />
                    </div>
                    {isLansia && (
                      <div>
                        <label className={labelCls}>Gula Darah (mg/dL) — Opsional</label>
                        <input type="text" placeholder="cth: 95" value={form.gula_darah} onChange={e => set('gula_darah', e.target.value)} className={inputCls} />
                      </div>
                    )}
                  </>
                )}
                <div className={isBalita ? 'col-span-2' : (isLansia ? 'col-span-2' : 'col-span-1')}>
                  <label className={labelCls}>Status Gizi</label>
                  <select value={form.status_gizi} onChange={e => set('status_gizi', e.target.value)} className={inputCls}>
                    <option value="Normal">✅ Normal (Gizi Baik)</option>
                    <option value="Kurang">⚠️ Kurang (Gizi Kurang)</option>
                    <option value="Buruk">❌ Buruk (Gizi Buruk)</option>
                    <option value="Lebih">📈 Lebih (Obesitas)</option>
                    <option value="Stunting">📉 Stunting</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tindakan Medis (Balita saja) */}
            {isBalita && (
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Syringe className="w-4 h-4 text-purple-500" />
                  <h4 className="text-sm font-bold text-slate-700">Tindakan Medis</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Imunisasi Diberikan</label>
                    <select value={form.imunisasi} onChange={e => set('imunisasi', e.target.value)} className={inputCls}>
                      <option value="">— Tidak ada —</option>
                      <option value="BCG">BCG</option>
                      <option value="HB0">Hepatitis B (HB0)</option>
                      <option value="DPT-1">DPT-HB-Hib 1</option>
                      <option value="DPT-2">DPT-HB-Hib 2</option>
                      <option value="DPT-3">DPT-HB-Hib 3</option>
                      <option value="Polio-1">Polio 1</option>
                      <option value="Polio-2">Polio 2</option>
                      <option value="Polio-3">Polio 3</option>
                      <option value="Polio-4">Polio 4</option>
                      <option value="Campak">Campak/MR</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Vitamin / Suplemen</label>
                    <select value={form.vitamin} onChange={e => set('vitamin', e.target.value)} className={inputCls}>
                      <option value="">— Tidak ada —</option>
                      <option value="Vitamin A (Merah)">Vitamin A (Kapsul Merah - 6-11 bln)</option>
                      <option value="Vitamin A (Biru)">Vitamin A (Kapsul Biru - 12-59 bln)</option>
                      <option value="Zink">Zinc Tablet</option>
                      <option value="Fe (Tablet Besi)">Tablet Besi (Fe)</option>
                      <option value="Oralit">Oralit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Catatan Bidan */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <ClipboardList className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-700">Catatan & Anjuran Bidan</h4>
              </div>
              <textarea rows={3} value={form.catatan} onChange={e => set('catatan', e.target.value)}
                placeholder={isBalita ? 'Contoh: BB naik 0.5kg. Pertumbuhan normal. Anjuran: ASI eksklusif dilanjutkan...' : 'Contoh: Tekanan darah tinggi. Anjuran: kurangi garam, kontrol 2 minggu...'}
                className={`${inputCls} resize-none`} />
            </div>

            {/* Sistem Rujukan */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" checked={form.dirujuk} onChange={e => setForm(f => ({ ...f, dirujuk: e.target.checked, alasan_rujukan: '' }))} />
                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Rujuk Pasien ke Puskesmas 🚨</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Aktifkan jika pasien membutuhkan penanganan serius.</p>
                </div>
              </label>

              {form.dirujuk && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wide">Alasan Rujukan</label>
                  <input type="text" placeholder="cth: Gizi buruk, atau BB tidak naik 2 bulan berturut-turut (2T)" value={form.alasan_rujukan} onChange={e => set('alasan_rujukan', e.target.value)} required
                    className="w-full px-3 py-2.5 border border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm transition-all bg-white" />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
          </div>
        </form>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-white transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Selesaikan Pemeriksaan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard Bidan ──────────────────────────────────────────────────────
export default function DashboardNakes() {
  const [antrians, setAntrians] = useState<any[]>([]);
  const [filter, setFilter] = useState<'semua' | 'tunggu_bidan' | 'selesai'>('tunggu_bidan');
  const [selectedAntrian, setSelectedAntrian] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [nakesUser] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('nakes_auth_user') ?? '{}'); } catch { return {}; }
  });
  const jadwalId = 1;

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('nakes_auth_token');
    localStorage.removeItem('nakes_auth_user');
    window.location.href = '/login';
  };

  const stats = {
    total:        antrians.length,
    tunggu_bidan: antrians.filter(a => a.status === 'tunggu_bidan' || a.status === 'diperiksa').length,
    selesai:      antrians.filter(a => a.status === 'selesai').length,
    imunisasi:    antrians.filter(a => a.status === 'selesai' && a.pemeriksaan?.imunisasi).length,
    gizi_kurang:  antrians.filter(a => a.status === 'selesai' && (a.pemeriksaan?.status_gizi === 'Kurang' || a.pemeriksaan?.status_gizi === 'Buruk' || a.pemeriksaan?.status_gizi === 'Stunting')).length,
    dirujuk:      antrians.filter(a => a.status === 'selesai' && a.pemeriksaan?.dirujuk).length,
  };
  useEffect(() => {
    fetchAntrian();
    const interval = setInterval(fetchAntrian, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAntrian = async () => {
    try {
      const res = await api.get(`/nakes/antrian?jadwal_id=${jadwalId}`);
      setAntrians(res.data.data ?? []);
    } catch { /* silent */ }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filtered = antrians.filter(a => {
    if (filter === 'tunggu_bidan') return a.status === 'tunggu_bidan' || a.status === 'diperiksa';
    if (filter === 'selesai') return a.status === 'selesai';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-800 leading-tight">Portal Bidan Desa</h1>
              <p className="text-xs text-slate-500">Meja 4 & 5 — Pemeriksaan Medis & Konsultasi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
              Live Monitoring
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 border-l border-slate-200 pl-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                {nakesUser?.name?.charAt(0) ?? 'B'}
              </div>
              <span className="font-semibold">{nakesUser?.name ?? 'Bidan'}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Warga Hari Ini', value: stats.total,        icon: Users,      color: 'from-slate-600 to-slate-700' },
            { label: 'Menunggu Pemeriksaan', value: stats.tunggu_bidan, icon: Clock,       color: 'from-blue-500 to-indigo-600' },
            { label: 'Sudah Selesai',         value: stats.selesai,      icon: CheckCircle2,color: 'from-emerald-500 to-teal-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg`}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black leading-none">{s.value}</p>
                  <p className="text-xs opacity-80 mt-1 font-medium">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Notif ── */}
        <AnimatePresence>
          {message && (
            <motion.div key="msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Antrian Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header with Filter */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Daftar Pasien Hari Ini</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {([
                { key: 'tunggu_bidan', label: 'Perlu Diperiksa' },
                { key: 'semua',        label: 'Semua' },
                { key: 'selesai',      label: 'Selesai' },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.key ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
                  {f.label}
                  {f.key === 'tunggu_bidan' && stats.tunggu_bidan > 0 && (
                    <span className="ml-1.5 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.tunggu_bidan}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                {filter === 'tunggu_bidan'
                  ? <><UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-medium">Tidak ada pasien yang menunggu</p><p className="text-xs text-slate-400 mt-1">Warga yang sudah diukur Kader akan muncul di sini</p></>
                  : <><Users className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-medium">Belum ada data</p></>
                }
              </div>
            ) : filtered.map((a, idx) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                className={`px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors ${a.status === 'tunggu_bidan' ? 'bg-blue-50/30' : ''}`}>

                {/* Nomor Antri */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0
                  ${a.status === 'selesai' ? 'bg-emerald-100 text-emerald-600' :
                    a.status === 'tunggu_bidan' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {String(a.nomor_antri).split('-')[1] || a.nomor_antri}
                </div>

                {/* Info Pasien */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-slate-800 truncate">{a.user?.name ?? '—'}</p>
                    {a.jenis_layanan === 'Lansia' ? (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">👴 Lansia</span>
                    ) : a.jenis_layanan === 'Ibu Hamil' ? (
                      <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">🤰 Ibu Hamil</span>
                    ) : a.jenis_layanan?.includes('Prasekolah') ? (
                      <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">👶 Balita & Prasekolah</span>
                    ) : (a.jenis_layanan?.includes('Remaja') || a.jenis_layanan?.includes('Sekolah')) ? (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">🎒 Usia Sekolah & Remaja</span>
                    ) : a.jenis_layanan?.includes('Nifas') ? (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">🤱 Ibu Nifas & Menyusui</span>
                    ) : (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">🧑 Usia Produktif</span>
                    )}
                  </div>
                  {/* Show measurement from Kader if exists */}
                  {(a.pemeriksaan?.berat_badan || a.pemeriksaan?.tinggi_badan) ? (
                    <p className="text-xs text-slate-500">
                      <Baby className="w-3 h-3 inline mr-1" />
                      BB: <strong>{a.pemeriksaan.berat_badan} kg</strong>
                      {a.pemeriksaan.tinggi_badan && <> • TB: <strong>{a.pemeriksaan.tinggi_badan} cm</strong></>}
                      <span className="ml-1 text-emerald-600">(sudah diukur Kader)</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Belum ada data pengukuran dari Kader</p>
                  )}
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={a.status} />
                  {(a.status === 'tunggu_bidan' || a.status === 'diperiksa') && (
                    <button onClick={() => setSelectedAntrian(a)}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-200">
                      <Stethoscope className="w-3.5 h-3.5" /> Periksa <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {a.status === 'selesai' && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Laporan Harian Ringkas ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-lg">Laporan Harian Ringkas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-slate-500 mb-1">Total Dilayani</span>
              <span className="text-2xl font-black text-slate-800">{stats.selesai}</span>
              <span className="text-[10px] text-slate-400 mt-1">warga selesai</span>
            </div>
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-blue-600 mb-1">Imunisasi</span>
              <span className="text-2xl font-black text-blue-800">{stats.imunisasi}</span>
              <span className="text-[10px] text-blue-500 mt-1">diberikan</span>
            </div>
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-amber-600 mb-1">Gizi Bermasalah</span>
              <span className="text-2xl font-black text-amber-800">{stats.gizi_kurang}</span>
              <span className="text-[10px] text-amber-500 mt-1">perlu pantauan</span>
            </div>
            <div className="p-4 rounded-xl border border-red-100 bg-red-50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-red-600 mb-1">Dirujuk</span>
              <span className="text-2xl font-black text-red-800">{stats.dirujuk}</span>
              <span className="text-[10px] text-red-500 mt-1">ke Puskesmas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedAntrian && (
          <PemeriksaanModal
            antrian={selectedAntrian}
            onClose={() => setSelectedAntrian(null)}
            onDone={() => {
              setSelectedAntrian(null);
              fetchAntrian();
              showMessage('success', `Pemeriksaan ${selectedAntrian.user?.name} berhasil disimpan!`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket, CheckCircle2, Clock, MapPin, Download,
  ChevronRight, Loader2, CalendarDays, Stethoscope, RefreshCw,
  QrCode, ShieldCheck, Bell, XCircle
} from 'lucide-react';
import api from '../lib/api';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  menunggu: { label: 'Menunggu Dipanggil', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="w-4 h-4" /> },
  hadir: { label: 'Sudah Hadir — Menuju Meja 2', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  pengukuran: { label: 'Sedang Pengukuran (Meja 2)', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: <Stethoscope className="w-4 h-4" /> },
  tunggu_bidan: { label: 'Menunggu Bidan (Meja 3)', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: <Bell className="w-4 h-4" /> },
  selesai: { label: 'Pemeriksaan Selesai ✓', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <ShieldCheck className="w-4 h-4" /> },
};

const JENIS_OPTIONS = [
  { value: 'Anak Prasekolah (0-70 bulan)', label: 'Anak Prasekolah', desc: 'Umur 0-70 bulan', icon: '👶' },
  { value: 'Ibu Hamil', label: 'Ibu Hamil', desc: 'Pemeriksaan Kehamilan', icon: '🤰' },
  { value: 'Ibu Nifas dan Menyusui', label: 'Ibu Nifas & Menyusui', desc: 'Pasca persalinan', icon: '🍼' },
  { value: 'Anak Sekolah dan Remaja', label: 'Anak Sekolah & Remaja', desc: 'Umur 6-18 tahun', icon: '🎒' },
  { value: 'Usia Produktif', label: 'Usia Produktif', desc: 'Dewasa 19-50 tahun', icon: '🧑' },
  { value: 'Lansia', label: 'Lansia', desc: 'Umur > 50 tahun', icon: '👴' },
];

export default function AntriPage() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<'pilih' | 'konfirmasi' | 'tiket'>('pilih');
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [jenisLayanan, setJenisLayanan] = useState<string>('Anak Prasekolah (0-70 bulan)');
  const [antriData, setAntriData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchData = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const [antrianRes, jadwalRes] = await Promise.all([
        api.get('/masyarakat/antrian').catch(() => ({ data: { data: null } })),
        api.get('/masyarakat/jadwal').catch(() => ({ data: { data: [] } })),
      ]);
      setJadwals(jadwalRes.data.data);
      if (antrianRes.data.data) {
        setAntriData(antrianRes.data.data);
        setStep('tiket');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('auth_user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const handleDaftar = async () => {
    if (!selectedJadwal) return;
    setSubmitting(true);
    try {
      const res = await api.post('/masyarakat/antrian', {
        jadwal_id: selectedJadwal.id,
        jenis_layanan: jenisLayanan,
      });
      setAntriData(res.data.data);
      setStep('tiket');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mendaftar antrian');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalkan = async () => {
    if (!antriData) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan antrian ini?')) return;
    try {
      await api.delete(`/masyarakat/antrian/${antriData.id}`);
      setAntriData(null);
      setSelectedJadwal(null);
      setStep('pilih');
    } catch {
      alert('Gagal membatalkan antrian');
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 50, 50, 300, 300);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `tiket-posyandu-${antriData?.nomor_antri}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  const qrValue = antriData ? JSON.stringify({
    app: 'POSYANDU-TUBANAN',
    antrian_id: antriData.id,
    nomor_antri: antriData.nomor_antri,
    nik: user?.nik,
    jenis: antriData.jenis_layanan,
    jadwal_id: antriData.jadwal_id,
  }) : '';

  const statusInfo = antriData ? (STATUS_MAP[antriData.status] ?? STATUS_MAP['menunggu']) : null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500">Memuat data antrian...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Antrian Digital Posyandu</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Daftar online — tunjukkan QR Code saat tiba</p>
        </div>
        {step === 'tiket' && (
          <button onClick={() => fetchData(true)} disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3 text-xs text-blue-700">
        <QrCode className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>QR Code berisi data tiket Anda yang dipindai Kader di Meja 1. Tidak perlu cetak — cukup tunjukkan layar HP Anda.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── STEP 1: PILIH JADWAL ─── */}
        {step === 'pilih' && (
          <motion.div key="pilih" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Pilih Jadwal Posyandu</h2>
            {jadwals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Belum ada jadwal tersedia</p>
                <p className="text-xs mt-1">Cek kembali besok atau hubungi kader desa</p>
              </div>
            ) : jadwals.map((j) => (
              <button key={j.id}
                onClick={() => { setSelectedJadwal(j); setStep('konfirmasi'); }}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-400 hover:shadow-md transition-all group flex gap-4 items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-blue-700">
                  <span className="text-[10px] font-bold uppercase">{new Date(j.tanggal).toLocaleString('id-ID', { month: 'short' })}</span>
                  <span className="text-xl font-black leading-none">{new Date(j.tanggal).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{j.posyandu.name}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{j.kegiatan}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />{j.waktu_mulai.substring(0, 5)} – {j.waktu_selesai.substring(0, 5)} WIB
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />{j.posyandu.location}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </motion.div>
        )}

        {/* ─── STEP 2: KONFIRMASI ─── */}
        {step === 'konfirmasi' && selectedJadwal && (
          <motion.div key="konfirmasi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="font-bold text-slate-800 mb-3">Konfirmasi Pendaftaran</h2>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Nama', value: user?.name },
                    { label: 'Posyandu', value: selectedJadwal.posyandu.name },
                    { label: 'Tanggal', value: new Date(selectedJadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { label: 'Waktu', value: `${selectedJadwal.waktu_mulai.substring(0, 5)} – ${selectedJadwal.waktu_selesai.substring(0, 5)} WIB` },
                    { label: 'Lokasi', value: selectedJadwal.posyandu.location },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-slate-400 flex-shrink-0">{row.label}</span>
                      <span className="font-semibold text-slate-700 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-600 mb-2.5 uppercase tracking-wide">Pilih Jenis Layanan</label>
                <div className="grid grid-cols-2 gap-2">
                  {JENIS_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setJenisLayanan(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${jenisLayanan === opt.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <span className="text-lg">{opt.icon}</span>
                      <p className={`text-xs font-bold mt-1 ${jenisLayanan === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('pilih')}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                ← Kembali
              </button>
              <button onClick={handleDaftar} disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Mendaftar...</> : 'Ambil Nomor Antri →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 3: TIKET + QR CODE ─── */}
        {step === 'tiket' && antriData && (
          <motion.div key="tiket" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Status badge */}
            {statusInfo && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${statusInfo.color} ${statusInfo.bg}`}>
                {statusInfo.icon}
                {statusInfo.label}
                {isRefreshing && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />}
              </div>
            )}

            {/* Tiket Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-100">
              {/* Header tiket */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket className="w-4 h-4 opacity-70" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Tiket Antrian Digital</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-blue-200">No. Antrian</p>
                      <p className="text-6xl font-black tracking-tight mt-0.5 leading-none">{antriData.nomor_antri}</p>
                      <p className="text-sm font-semibold mt-2 text-blue-100">{antriData.jenis_layanan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200">{antriData.jadwal?.posyandu?.name}</p>
                      <p className="text-sm font-bold mt-0.5">{antriData.jadwal?.kegiatan}</p>
                      <p className="text-xs text-blue-200 mt-1">
                        {new Date(antriData.jadwal?.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perforated separator */}
              <div className="flex items-center px-3">
                <div className="w-6 h-6 bg-slate-50 rounded-full -ml-9 border border-slate-200 flex-shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-1" />
                <div className="w-6 h-6 bg-slate-50 rounded-full -mr-9 border border-slate-200 flex-shrink-0" />
              </div>

              {/* QR + Detail */}
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-6 items-center">
                {/* QR Code Block */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div ref={qrRef} className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md">
                    <QRCodeSVG
                      value={qrValue}
                      size={160}
                      level="M"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#1e293b"
                      imageSettings={{
                        src: '', height: 0, width: 0, excavate: false,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-medium">Pindai di Meja 1 Kader</p>
                </div>

                {/* Info detail */}
                <div className="flex-1 space-y-2.5 text-sm w-full sm:w-auto">
                  {[
                    { label: 'Nama', value: user?.name },
                    { label: 'Layanan', value: antriData.jenis_layanan },
                    { label: 'Tanggal', value: new Date(antriData.jadwal?.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) },
                    { label: 'Jam', value: `${antriData.jadwal?.waktu_mulai?.substring(0, 5)} – ${antriData.jadwal?.waktu_selesai?.substring(0, 5)} WIB` },
                    { label: 'Lokasi', value: antriData.jadwal?.posyandu?.location },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between gap-2">
                      <span className="text-slate-400 flex-shrink-0">{row.label}</span>
                      <span className="font-semibold text-slate-700 text-right text-xs sm:text-sm leading-snug">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700 text-xs font-bold">Terdaftar di Server Posyandu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruksi cara pakai */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Cara Penggunaan Tiket</p>
              {[
                { no: '1', text: 'Datang ke Posyandu sesuai tanggal & jam di atas' },
                { no: '2', text: 'Temui Kader di Meja 1 (Pendaftaran)' },
                { no: '3', text: 'Tunjukkan QR Code ini — Kader akan scan untuk verifikasi' },
                { no: '4', text: 'Ikuti alur: Meja 2 (Pengukuran) → Meja 3 (Bidan/Dokter)' },
              ].map(s => (
                <div key={s.no} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{s.no}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleDownloadQR}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-200">
                <Download className="w-4 h-4" /> Simpan QR
              </button>
              <a href="/"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors">
                Ke Beranda
              </a>
            </div>

            <div className="text-center">
              <button onClick={handleBatalkan}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Batal Hadir (Hapus Antrian)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

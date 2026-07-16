import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, Activity, FileText, QrCode, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('auth_user');
    if (userData) setUser(JSON.parse(userData));

    api.get('/masyarakat/dashboard')
      .then(res => setDashboardData(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  // QR value berisi NIK + nama untuk identifikasi cepat Kader
  const qrIdentitas = user ? JSON.stringify({
    app: 'POSYANDU-TUBANAN',
    type: 'IDENTITAS_WARGA',
    nik: user.nik,
    nama: user.name,
    user_id: user.id,
  }) : '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Selamat Datang, {user?.name?.split(' ')[0] || 'Warga'}! 👋</h1>
            <p className="text-blue-100 text-sm leading-relaxed max-w-md">
              Pantau jadwal posyandu, cek status kesehatan, dan nikmati layanan kesehatan desa secara digital.
            </p>
          </div>

          {/* QR Identitas Mini di hero */}
          {user?.nik && (
            <button
              onClick={() => setShowQr(true)}
              className="flex flex-col items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all group flex-shrink-0"
            >
              <div className="bg-white rounded-xl p-2 shadow-md">
                <QRCodeSVG value={qrIdentitas} size={72} level="M" bgColor="#ffffff" fgColor="#1e293b" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-white">QR Identitas Saya</p>
                <p className="text-[10px] text-blue-200">Tap untuk perbesar</p>
              </div>
            </button>
          )}
        </div>
      </motion.div>

      {/* Modal QR Perbesar */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQr(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Kartu Identitas Digital</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">Tunjukkan ke Kader Posyandu untuk verifikasi identitas Anda</p>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-4">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">POSYANDU DESA TUBANAN</p>
              <div className="bg-white rounded-xl p-3 mx-auto w-fit shadow-lg mb-3">
                <QRCodeSVG value={qrIdentitas} size={200} level="M" bgColor="#ffffff" fgColor="#1e293b" />
              </div>
              <p className="font-black text-xl mt-2">{user?.name}</p>
              <p className="text-blue-200 text-sm font-mono mt-0.5">
                {user?.nik ? user.nik.slice(0, 8) + '••••••••' : '-'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 text-left mb-4 flex gap-2">
              <QrCode className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>QR ini berisi NIK Anda. Kader akan scan untuk identifikasi tanpa perlu antrian manual.</p>
            </div>

            <button onClick={() => setShowQr(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
              Tutup
            </button>
          </motion.div>
        </div>
      )}

      {/* Pengumuman */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
          📢
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Pengumuman</span>
          </div>
          <h3 className="font-bold text-base leading-tight">Penimbangan Rutin Bulan Agustus 2026</h3>
          <p className="text-emerald-100 text-xs mt-1">Hadir pada <b>Rabu, 12 Agustus 2026</b> pukul 08.00 di Balai Desa Tubanan Lor. Bawa Buku KIA Anda. Gratis untuk seluruh warga.</p>
        </div>
        <div className="bg-white text-teal-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm mt-3 sm:mt-0 self-start sm:self-center whitespace-nowrap">
          Lihat Detail
        </div>
      </motion.div>

      {/* Shortcut QR identitas card (jika tidak ada NIK) */}
      {user && !user.nik && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-800"
        >
          <QrCode className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Lengkapi NIK untuk Aktifkan QR Identitas</p>
            <p className="text-xs text-amber-600 mt-0.5">Kader bisa scan QR Anda untuk verifikasi tanpa perlu antri manual</p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
        </motion.div>
      )}

      {/* Akses Cepat: Antrian & QR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link to="/antri"
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-blue-200 group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Ambil Antrian</p>
            <p className="text-[11px] text-blue-200">Daftar jadwal posyandu</p>
          </div>
        </Link>
        <button
          onClick={() => setShowQr(true)}
          className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl p-4 transition-colors shadow-sm group"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">QR Identitas</p>
            <p className="text-[11px] text-slate-400">Tunjukkan ke Kader</p>
          </div>
        </button>
      </motion.div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jadwal Terdekat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Jadwal Posyandu Terdekat
              </h2>
              <Link to="/jadwal" className="text-sm font-medium text-blue-600 hover:text-blue-700">Lihat Semua</Link>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 flex-1">
              {dashboardData?.jadwal_terdekat ? (
                <>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-rose-500 uppercase">{new Date(dashboardData.jadwal_terdekat.tanggal).toLocaleString('id-ID', { month: 'short' })}</span>
                      <span className="text-xl font-bold text-slate-800">{new Date(dashboardData.jadwal_terdekat.tanggal).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-base mb-1">{dashboardData.jadwal_terdekat.kegiatan}</h3>
                      <div className="space-y-1.5">
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" /> {dashboardData.jadwal_terdekat.waktu_mulai.substring(0, 5)} - {dashboardData.jadwal_terdekat.waktu_selesai.substring(0, 5)} WIB
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" /> {dashboardData.jadwal_terdekat.posyandu.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200/50">{dashboardData.jadwal_terdekat.posyandu.name}</span>
                  </div>
                  <Link to="/antri" className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                    Daftar Antrian <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-500">Belum ada jadwal bulan ini.</p>
              )}
            </div>
          </motion.div>

          {/* Ringkasan KMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                KMS Digital (Balita)
              </h2>
              <Link to="/kms" className="text-sm font-medium text-blue-600 hover:text-blue-700">Detail KMS</Link>
            </div>

            <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/50 p-5 flex-1 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <FileText className="w-32 h-32 text-emerald-600 translate-x-8 translate-y-8" />
              </div>

              {dashboardData?.balita ? (
                <>
                  <h3 className="font-semibold text-slate-800 mb-4">{dashboardData.balita.nama} ({dashboardData.balita.jenis_kelamin})</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">Berat Badan</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-800">{dashboardData.pemeriksaan_terakhir?.berat_badan || '-'}</span>
                        <span className="text-sm font-medium text-slate-500">kg</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-medium mt-1">{dashboardData.pemeriksaan_terakhir?.status_gizi || '-'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">Tinggi Badan</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-800">{dashboardData.pemeriksaan_terakhir?.tinggi_badan || '-'}</span>
                        <span className="text-sm font-medium text-slate-500">cm</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/kms" className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors relative z-10">
                    Lihat Grafik Pertumbuhan <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-500 relative z-10">Data KMS Balita tidak ditemukan.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Identitas Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQr(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
              &times;
            </button>
            
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">QR Identitas Warga</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Tunjukkan QR Code ini kepada Kader Posyandu untuk verifikasi kedatangan.</p>
            
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 inline-block shadow-sm">
              <QRCodeSVG value={qrIdentitas} size={200} level="M" />
            </div>
            
            <div className="mt-6 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 text-left">
              <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 font-mono">NIK: {user?.nik || 'Belum diisi'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

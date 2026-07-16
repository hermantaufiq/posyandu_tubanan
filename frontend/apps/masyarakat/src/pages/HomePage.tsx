import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, Activity, FileText } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('auth_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name || 'Warga'}! 👋</h1>
          <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
            Pantau jadwal posyandu, cek status kesehatan keluarga, dan nikmati layanan kesehatan desa secara digital.
          </p>
        </div>
      </motion.div>

      {/* Pengumuman Posyandu - Realistic announcement like WhatsApp blast from Kader */}
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

      {/* Main Grid */}
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
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Lihat Semua</button>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 flex-1">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-rose-500 uppercase">Agu</span>
                <span className="text-xl font-bold text-slate-800">12</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">Posyandu Balita &amp; Ibu Hamil</h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> 08:00 - 11:00 WIB
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" /> Balai Desa Tubanan Lor
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200/50">Imunisasi Polio</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200/50">Vitamin A</span>
            </div>
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
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Detail KMS</button>
          </div>

          <div className="bg-emerald-50/50 rounded-xl border border-emerald-100/50 p-5 flex-1 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <FileText className="w-32 h-32 text-emerald-600 translate-x-8 translate-y-8" />
            </div>

            <h3 className="font-semibold text-slate-800 mb-4">Ananda Budi (2 Thn 4 Bln)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Berat Badan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">12.5</span>
                  <span className="text-sm font-medium text-slate-500">kg</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ Naik 0.5 kg</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Tinggi Badan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">89</span>
                  <span className="text-sm font-medium text-slate-500">cm</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">Sesuai standar</p>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors relative z-10">
              Lihat Grafik Pertumbuhan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

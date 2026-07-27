import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Info, ChevronRight } from 'lucide-react';
import api from '../lib/api';

export default function JadwalPage() {
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/masyarakat/jadwal')
      .then(res => {
        setJadwals(res.data.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Jadwal Posyandu</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Jangan lewatkan jadwal pelayanan posyandu untuk keluarga Anda</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3 text-blue-800 text-xs sm:text-sm">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>Bawalah <b>Buku KIA</b> setiap kali datang ke Posyandu. Pelayanan gratis untuk seluruh warga Desa Tubanan.</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : jadwals.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Belum ada jadwal yang tersedia.</p>
        ) : jadwals.map((schedule, idx) => {
          const dateObj = new Date(schedule.tanggal);
          const isCompleted = dateObj < new Date(new Date().setHours(0,0,0,0));
          const isNearest = idx === 0 && !isCompleted;

          return (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-xl sm:rounded-2xl border p-4 sm:p-5 flex gap-4 transition-shadow
                ${isCompleted ? 'border-slate-200 opacity-60' : 'border-slate-200/60 shadow-sm hover:shadow-md'}`}
            >
              {/* Date Badge */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border
                ${isCompleted
                  ? 'bg-slate-50 border-slate-200 text-slate-400'
                  : 'bg-blue-50 border-blue-100 text-blue-700'}`}
              >
                <span className="text-[10px] sm:text-xs font-semibold uppercase">{dateObj.toLocaleString('id-ID', { month: 'short' })}</span>
                <span className="text-xl sm:text-2xl font-bold leading-none mt-0.5">{dateObj.getDate()}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 leading-snug">{schedule.kegiatan}</h3>
                  {isCompleted && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0">Selesai</span>
                  )}
                  {isNearest && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0">Terdekat</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-1 sm:gap-5 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{schedule.waktu_mulai.substring(0,5)} - {schedule.waktu_selesai.substring(0,5)} WIB
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{schedule.posyandu.location}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-medium">{schedule.posyandu.name}</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 self-center flex-shrink-0 hidden sm:block" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Clock, Info } from 'lucide-react';

const mockSchedules = [
  { id: 1, date: '12', month: 'Agu', title: 'Posyandu Balita & Ibu Hamil', time: '08:00 - 11:00 WIB', location: 'Balai Desa Tubanan Lor', badges: ['Imunisasi Polio', 'Vitamin A'], status: 'upcoming' },
  { id: 2, date: '15', month: 'Sep', title: 'Posyandu Lansia', time: '09:00 - 11:00 WIB', location: 'Balai RT 03 RW 01', badges: ['Cek Tensi', 'Senam Lansia'], status: 'upcoming' },
  { id: 3, date: '10', month: 'Jul', title: 'Posyandu Balita', time: '08:00 - 11:00 WIB', location: 'Balai Desa Tubanan Lor', badges: ['Imunisasi Dasar'], status: 'completed' },
];

export default function JadwalPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Jadwal Posyandu</h1>
        <p className="text-slate-500 text-sm mt-1">Jangan lewatkan jadwal pelayanan posyandu untuk keluarga Anda</p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800 text-sm">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p>Bawalah <b>Buku KIA (Kesehatan Ibu dan Anak)</b> setiap kali datang ke Posyandu. Pelayanan posyandu gratis untuk seluruh warga Desa Tubanan.</p>
      </div>

      <div className="space-y-4">
        {mockSchedules.map((schedule, idx) => (
          <motion.div 
            key={schedule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-2xl border ${schedule.status === 'completed' ? 'border-slate-200 opacity-60' : 'border-slate-200/60 shadow-sm'} p-5 sm:p-6 flex flex-col sm:flex-row gap-5 transition-all hover:shadow-md`}
          >
            <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${schedule.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
              <span className="text-xs font-semibold uppercase">{schedule.month}</span>
              <span className="text-2xl font-bold leading-none mt-0.5">{schedule.date}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h3 className={`font-bold text-lg ${schedule.status === 'completed' ? 'text-slate-600' : 'text-slate-800'}`}>{schedule.title}</h3>
                {schedule.status === 'completed' && <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-md font-medium self-start">Selesai</span>}
                {schedule.status === 'upcoming' && idx === 0 && <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium self-start">Terdekat</span>}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {schedule.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {schedule.location}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {schedule.badges.map(badge => (
                  <span key={badge} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Syringe, Scale, Stethoscope, CheckCircle2 } from 'lucide-react';

const mockHistory = [
  {
    id: 1,
    date: '10 Juli 2026',
    title: 'Imunisasi DPT-HB-Hib 3',
    description: 'Diberikan oleh Bidan Ani. Kondisi anak sehat, tidak ada efek samping signifikan.',
    icon: Syringe,
    color: 'text-rose-500',
    bg: 'bg-rose-100',
    borderColor: 'border-rose-200',
  },
  {
    id: 2,
    date: '12 Juni 2026',
    title: 'Penimbangan Rutin',
    description: 'Berat: 10.2 kg, Tinggi: 84 cm. Status Gizi: Baik. Pertumbuhan sesuai kurva WHO.',
    icon: Scale,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
  {
    id: 3,
    date: '15 Mei 2026',
    title: 'Pemberian Vitamin A',
    description: 'Mendapat Kapsul Merah Vitamin A dosis tinggi (200.000 IU) — Bulan Vitamin A Mei.',
    icon: Stethoscope,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  {
    id: 4,
    date: '10 April 2026',
    title: 'Penimbangan Rutin',
    description: 'Berat: 9.5 kg, Tinggi: 80 cm. Status Gizi: Baik. Catatan: konsumsi sayuran ditingkatkan.',
    icon: Scale,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
];

export default function RiwayatPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Riwayat Layanan</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Rekam jejak kesehatan dan pelayanan keluarga Anda</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line — hidden on very small screens, shown from sm */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 hidden sm:block" />

        <div className="space-y-4 sm:space-y-6">
          {mockHistory.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 }}
                className="flex gap-0 sm:gap-5"
              >
                {/* Timeline dot (desktop only) */}
                <div className="relative z-10 hidden sm:flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center border-4 border-slate-50`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>

                {/* Card */}
                <div className={`flex-1 bg-white rounded-xl sm:rounded-2xl border ${item.borderColor} p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-start gap-3 justify-between flex-wrap">
                    {/* Mobile icon */}
                    <div className="flex items-center gap-3 sm:gap-0">
                      <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 sm:hidden`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md flex-shrink-0">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">{item.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-slate-500">Diverifikasi oleh Kader Posyandu</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

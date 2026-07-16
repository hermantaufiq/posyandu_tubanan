import { motion } from 'framer-motion';
import { Syringe, Scale, Stethoscope, CheckCircle2 } from 'lucide-react';

const mockHistory = [
  { id: 1, date: '10 Juli 2026', type: 'imunisasi', title: 'Imunisasi DPT-HB-Hib 3', description: 'Diberikan oleh Bidan Ani. Kondisi anak sehat, tidak ada demam tinggi pasca imunisasi.', icon: Syringe, color: 'text-rose-500', bg: 'bg-rose-100' },
  { id: 2, date: '12 Juni 2026', type: 'penimbangan', title: 'Penimbangan Rutin', description: 'Berat: 10.2 kg, Tinggi: 84 cm. Status Gizi: Baik. Pertumbuhan sesuai standar WHO.', icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { id: 3, date: '15 Mei 2026', type: 'pemeriksaan', title: 'Pemberian Vitamin A', description: 'Mendapat Kapsul Biru (Vitamin A Dosis Tinggi 100.000 IU).', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 4, date: '10 April 2026', type: 'penimbangan', title: 'Penimbangan Rutin', description: 'Berat: 9.5 kg, Tinggi: 80 cm. Status Gizi: Baik.', icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

export default function RiwayatPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Layanan</h1>
        <p className="text-slate-500 text-sm mt-1">Rekam jejak kesehatan dan pelayanan yang telah diterima keluarga Anda</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200" />
        
        <div className="space-y-8 relative">
          {mockHistory.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex gap-6"
              >
                <div className="relative z-10 w-16 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center border-4 border-slate-50`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
                
                <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-500 font-medium">Telah diverifikasi oleh Kader Posyandu</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

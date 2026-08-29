import { FileBarChart } from "lucide-react";

export default function LaporanSpmPage() {
  return (
    <div className="p-8 pb-24 font-sans text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <FileBarChart className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Rekap Laporan SPM</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Laporan Standar Pelayanan Minimal</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Dalam Pengembangan</h2>
        <p className="text-slate-500">Halaman ini akan segera hadir pada update berikutnya.</p>
      </div>
    </div>
  );
}

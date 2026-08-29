import { Settings } from "lucide-react";

export default function InsentifPage() {
  return (
    <div className="p-8 pb-24 font-sans text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Pembayaran Insentif</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Kelola insentif dan daftar kehadiran kader</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Dalam Pengembangan</h2>
        <p className="text-slate-500">Fitur pengelolaan insentif kader akan segera hadir pada update berikutnya.</p>
      </div>
    </div>
  );
}

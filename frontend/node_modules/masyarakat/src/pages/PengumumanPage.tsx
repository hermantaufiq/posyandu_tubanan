import { useState, useEffect } from "react";
import { Bell, Calendar, Syringe, Heart, Info, Loader2, Megaphone } from "lucide-react";
import api from "../lib/api";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kategori: string;
  tanggal: string;
}

const KATEGORI_MAP: Record<string, { label: string; icon: typeof Bell; color: string; bg: string }> = {
  jadwal:    { label: "Jadwal Posyandu", icon: Calendar, color: "text-blue-400",  bg: "bg-blue-500/10 border-blue-500/20" },
  imunisasi: { label: "Imunisasi",       icon: Syringe,  color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  kesehatan: { label: "Info Kesehatan",  icon: Heart,    color: "text-rose-400",  bg: "bg-rose-500/10 border-rose-500/20" },
  umum:      { label: "Umum",            icon: Info,     color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
};

export default function PengumumanPage() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/masyarakat/pengumuman")
      .then(r => setList(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Pengumuman</h1>
          <p className="text-slate-400 text-xs">Info terbaru dari Posyandu Desa Tubanan</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-700" />
          <p className="text-slate-400 font-medium">Belum ada pengumuman</p>
          <p className="text-slate-600 text-sm mt-1">Pantau terus untuk info terbaru dari posyandu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(p => {
            const k = KATEGORI_MAP[p.kategori] ?? KATEGORI_MAP.umum;
            const KIcon = k.icon;
            return (
              <div key={p.id} className={`bg-slate-900 border rounded-2xl p-4 border-slate-800`}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${k.bg}`}>
                    <KIcon className={`w-5 h-5 ${k.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${k.bg} ${k.color}`}>{k.label}</span>
                      <span className="text-slate-500 text-xs">{p.tanggal}</span>
                    </div>
                    <p className="font-semibold text-white text-sm mb-1">{p.judul}</p>
                    <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">{p.isi}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

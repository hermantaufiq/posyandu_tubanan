import { useState, useEffect } from "react";
import {
  Megaphone, Plus, Trash2, Copy, CheckCircle,
  Calendar, Syringe, Heart, Info, Loader2, MessageCircle
} from "lucide-react";
import api from "../lib/api";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kategori: string;
  oleh: string;
  tanggal: string;
}

const KATEGORI = [
  { value: "jadwal",    label: "Jadwal Posyandu",   icon: Calendar,  color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "imunisasi", label: "Imunisasi",          icon: Syringe,   color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "kesehatan", label: "Info Kesehatan",     icon: Heart,     color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { value: "umum",      label: "Umum",               icon: Info,      color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
];

function kategoriInfo(k: string) {
  return KATEGORI.find(x => x.value === k) ?? KATEGORI[3];
}

function buildWaText(judul: string, isi: string, kategori: string) {
  const emoji: Record<string,string> = { jadwal:"📅", imunisasi:"💉", kesehatan:"🩺", umum:"📢" };
  return `${emoji[kategori] ?? "📢"} *PENGUMUMAN POSYANDU TUBANAN*\n━━━━━━━━━━━━━━━━━━━━\n*${judul}*\n\n${isi}\n━━━━━━━━━━━━━━━━━━━━\n🌿 _Tim Posyandu Desa Tubanan_\n📱 _Informasi lengkap di aplikasi Posyandu Tubanan_`;
}

export default function PengumumanPage() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ judul: "", isi: "", kategori: "jadwal" });

  const load = () => {
    setLoading(true);
    api.get("/admin/pengumuman").then(r => setList(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.isi.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/admin/pengumuman", form);
      setForm({ judul: "", isi: "", kategori: "jadwal" });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    setDeleting(id);
    await api.delete(`/admin/pengumuman/${id}`);
    setList(l => l.filter(x => x.id !== id));
    setDeleting(null);
  };

  const copyText = (p: Pengumuman) => {
    navigator.clipboard.writeText(buildWaText(p.judul, p.isi, p.kategori));
    setCopied(p.id);
    setTimeout(() => setCopied(null), 2500);
  };

  const openWa = (p: Pengumuman) => {
    const text = encodeURIComponent(buildWaText(p.judul, p.isi, p.kategori));
    // Tanpa parameter phone, WA akan membuka menu pencarian kontak/grup (Forward)
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400" /> Pengumuman
        </h2>
        <p className="text-slate-400 text-sm mt-1">Buat pengumuman untuk warga. Bagikan ke WhatsApp grup dengan satu klik.</p>
      </div>

      {/* Form Buat Pengumuman */}
      <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-white text-sm">📝 Buat Pengumuman Baru</h3>

        {/* Kategori */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Kategori</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {KATEGORI.map(k => (
              <button
                key={k.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, kategori: k.value }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  form.kategori === k.value
                    ? k.color + " border-current"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                <k.icon className="w-3.5 h-3.5" />
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Judul */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Judul Pengumuman</label>
          <input
            value={form.judul}
            onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
            placeholder='Contoh: Jadwal Posyandu Mekar Sari - Juli 2026'
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Isi */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Isi Pengumuman</label>
          <textarea
            value={form.isi}
            onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
            rows={4}
            placeholder="Contoh: Posyandu Mekar Sari akan buka pada Sabtu, 26 Juli 2026 pukul 08.00–11.00 WIB. Harap membawa buku KIA dan KTP."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !form.judul.trim() || !form.isi.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Publikasikan
        </button>
      </form>

      {/* Daftar Pengumuman */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white text-sm">📋 Riwayat Pengumuman ({list.length})</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada pengumuman. Buat pengumuman pertama Anda!</p>
          </div>
        ) : (
          list.map(p => {
            const ki = kategoriInfo(p.kategori);
            const KIcon = ki.icon;
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${ki.color}`}>
                    <KIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-white text-sm">{p.judul}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ki.color}`}>{ki.label}</span>
                    </div>
                    <p className="text-slate-400 text-sm whitespace-pre-wrap mt-1 mb-2">{p.isi}</p>
                    <p className="text-slate-600 text-xs">oleh {p.oleh} · {p.tanggal}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                  {/* Preview WA text */}
                  <button
                    onClick={() => copyText(p)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied === p.id ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === p.id ? "Tersalin!" : "Salin Teks WA"}
                  </button>

                  <button
                    onClick={() => openWa(p)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Kirim via WhatsApp
                  </button>

                  <button
                    onClick={() => hapus(p.id)}
                    disabled={deleting === p.id}
                    className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                  >
                    {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

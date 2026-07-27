import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, RefreshCw, Save, CheckCircle, Copy, Users, Stethoscope } from "lucide-react";
import api from "../lib/api";

export default function PengaturanPage() {
  const [nakesCode, setNakesCode] = useState("");
  const [kaderCode, setKaderCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNakes, setShowNakes] = useState(false);
  const [showKader, setShowKader] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/invite-codes")
      .then(r => {
        setNakesCode(r.data.nakes_code || "");
        setKaderCode(r.data.kader_code || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/invite-codes", { nakes_code: nakesCode, kader_code: kaderCode });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCode = (prefix: string) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = prefix;
    for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Pengaturan Sistem</h2>
        <p className="text-slate-400 text-sm mt-1">Kelola kode undangan untuk pendaftaran Tenaga Kesehatan dan Kader Posyandu.</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-blue-300 text-sm font-medium mb-1">ℹ️ Cara Kerja Kode Undangan</p>
        <p className="text-slate-400 text-sm">Tenaga Kesehatan dan Kader yang ingin mendaftar harus memasukkan kode undangan ini saat registrasi. Ganti kode secara berkala untuk keamanan.</p>
      </div>

      {/* Nakes Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Kode Undangan Tenaga Kesehatan</p>
            <p className="text-xs text-slate-400">Bidan, Dokter, Perawat yang mendaftar memerlukan kode ini</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showNakes ? "text" : "password"}
              value={nakesCode}
              onChange={e => setNakesCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-blue-500"
              placeholder="KODE_NAKES"
            />
          </div>
          <button onClick={() => setShowNakes(v => !v)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-white transition-colors">
            {showNakes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => copyCode(nakesCode, "nakes")} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-green-400 transition-colors" title="Salin kode">
            {copied === "nakes" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={() => setNakesCode(generateCode("NAKES"))} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-blue-400 transition-colors" title="Buat kode baru">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kader Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Kode Undangan Kader Posyandu</p>
            <p className="text-xs text-slate-400">Kader yang mendaftar untuk sistem kader memerlukan kode ini</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showKader ? "text" : "password"}
              value={kaderCode}
              onChange={e => setKaderCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-blue-500"
              placeholder="KODE_KADER"
            />
          </div>
          <button onClick={() => setShowKader(v => !v)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-white transition-colors">
            {showKader ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => copyCode(kaderCode, "kader")} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-green-400 transition-colors" title="Salin kode">
            {copied === "kader" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={() => setKaderCode(generateCode("KADER"))} className="bg-slate-800 border border-slate-700 rounded-xl px-3 text-slate-400 hover:text-blue-400 transition-colors" title="Buat kode baru">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : saved ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}

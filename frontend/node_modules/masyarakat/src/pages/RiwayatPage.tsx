import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, ShieldAlert, Stethoscope, ClipboardList,
  Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Plus, Send, FileX, Info
} from "lucide-react";
import api from "../lib/api";

const INDIKATOR_TBC = [
  "Batuk berdahak > 2 minggu",
  "Demam hilang timbul > 1 bulan",
  "Berkeringat malam tanpa aktivitas fisik",
  "BB turun drastis tanpa sebab jelas",
];

type Tab = "semua" | "penimbangan" | "tbc" | "pelayanan" | "mandiri";

function BadgeHasil({ hasil }: { hasil: string }) {
  if (hasil === "Suspek TBC")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" />Suspek TBC</span>;
  if (hasil === "Perlu Pantau")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><Info className="w-3 h-3" />Perlu Pantau</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" />Negatif</span>;
}

function BadgeIMT({ kategori }: { kategori: string | null }) {
  if (!kategori) return <span className="text-slate-300">-</span>;
  const map: Record<string, string> = {
    Kurus: "bg-blue-100 text-blue-700",
    Normal: "bg-emerald-100 text-emerald-700",
    Overweight: "bg-amber-100 text-amber-700",
    Obesitas: "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[kategori] ?? "bg-slate-100 text-slate-600"}`}>{kategori}</span>;
}

function CellVal({ val, unit }: { val: any; unit?: string }) {
  if (val === null || val === undefined || val === "") return <span className="text-slate-300">-</span>;
  return <span className="font-semibold text-slate-700">{val}{unit ? <span className="text-slate-400 font-normal text-[10px] ml-0.5">{unit}</span> : ""}</span>;
}

function Bool({ val }: { val: boolean }) {
  return val
    ? <CheckCircle2 className="w-4 h-4 text-red-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <FileX className="w-12 h-12 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function TabPenimbangan({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-blue-50 text-blue-800 uppercase tracking-wide text-[10px]">
            <th className="px-3 py-2.5 text-left whitespace-nowrap">Tanggal</th>
            <th className="px-3 py-2.5 text-left whitespace-nowrap">Posyandu</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">BB (kg)</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">TB/PB (cm)</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">L. Kepala (cm)</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">L. Perut (cm)</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">LiLA (cm)</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">IMT</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Status Gizi</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Imunisasi</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Vitamin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
              <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 font-medium">{row.tanggal_label}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 text-[11px]">{row.posyandu}</td>
              <td className="px-3 py-2.5 text-center"><CellVal val={row.penimbangan?.berat_badan} unit="kg" /></td>
              <td className="px-3 py-2.5 text-center"><CellVal val={row.penimbangan?.tinggi_badan} unit="cm" /></td>
              <td className="px-3 py-2.5 text-center"><CellVal val={row.penimbangan?.lingkar_kepala} unit="cm" /></td>
              <td className="px-3 py-2.5 text-center"><CellVal val={row.penimbangan?.lingkar_perut} unit="cm" /></td>
              <td className="px-3 py-2.5 text-center"><CellVal val={row.penimbangan?.lila} unit="cm" /></td>
              <td className="px-3 py-2.5 text-center">
                {row.penimbangan?.imt ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-semibold text-slate-700">{row.penimbangan.imt}</span>
                    <BadgeIMT kategori={row.penimbangan.kategori_imt} />
                  </div>
                ) : <span className="text-slate-300">-</span>}
              </td>
              <td className="px-3 py-2.5 text-center text-[11px]"><CellVal val={row.penimbangan?.status_gizi} /></td>
              <td className="px-3 py-2.5 text-center text-[11px]"><CellVal val={row.penimbangan?.imunisasi} /></td>
              <td className="px-3 py-2.5 text-center text-[11px]"><CellVal val={row.penimbangan?.vitamin} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabSkringingTBC({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-amber-50 text-amber-800 uppercase tracking-wide text-[10px]">
            <th className="px-3 py-2.5 text-left whitespace-nowrap">Tanggal</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Sumber</th>
            <th className="px-3 py-2.5 text-center">Batuk</th>
            <th className="px-3 py-2.5 text-center">Demam</th>
            <th className="px-3 py-2.5 text-center">Kgt Malam</th>
            <th className="px-3 py-2.5 text-center">BB Turun</th>
            <th className="px-3 py-2.5 text-center">Jml Gejala</th>
            <th className="px-3 py-2.5 text-center">Hasil</th>
            <th className="px-3 py-2.5 text-center">Dirujuk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const d = row.skrining_tbc;
            return (
              <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 font-medium">{row.tanggal_label}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.sumber === "mandiri" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {row.sumber === "mandiri" ? "Mandiri" : "Kader"}
                  </span>
                </td>
                {[0, 1, 2, 3].map(idx => (
                  <td key={idx} className="px-3 py-2.5 text-center">
                    <Bool val={d?.detail?.[idx] === true} />
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">
                  <span className={`text-sm font-bold ${(d?.jumlah_gejala ?? 0) >= 2 ? "text-red-600" : (d?.jumlah_gejala ?? 0) === 1 ? "text-amber-600" : "text-slate-400"}`}>
                    {d?.jumlah_gejala ?? 0}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center"><BadgeHasil hasil={d?.hasil ?? "Negatif"} /></td>
                <td className="px-3 py-2.5 text-center">
                  {d?.dirujuk ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Ya</span> : <span className="text-slate-300">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabPelayanan({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-emerald-50 text-emerald-800 uppercase tracking-wide text-[10px]">
            <th className="px-3 py-2.5 text-left whitespace-nowrap">Tanggal</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Tensi</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Gula Darah</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Uk. Kandungan</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Skor AKS</th>
            <th className="px-3 py-2.5 text-left whitespace-nowrap">Catatan Bidan</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Rujukan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => {
            const p = row.pelayanan;
            return (
              <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 font-medium">{row.tanggal_label}</td>
                <td className="px-3 py-2.5 text-center"><CellVal val={p?.tensi} /></td>
                <td className="px-3 py-2.5 text-center"><CellVal val={p?.gula_darah} unit="mg/dL" /></td>
                <td className="px-3 py-2.5 text-center"><CellVal val={p?.usia_kandungan} unit="mgg" /></td>
                <td className="px-3 py-2.5 text-center">
                  {p?.aks_score !== null && p?.aks_score !== undefined ? (
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-700">{p.aks_score}</span>
                      <span className="text-[9px] text-slate-400">{p.aks_score >= 20 ? "Mandiri" : p.aks_score >= 12 ? "Ringan" : "Berat"}</span>
                    </div>
                  ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-3 py-2.5 max-w-xs">
                  {p?.catatan ? <span className="line-clamp-2 text-slate-600">{p.catatan}</span> : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {p?.dirujuk ? (
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Ya</span>
                      {p.alasan_rujukan && <p className="text-[10px] text-red-500 mt-0.5">{p.alasan_rujukan}</p>}
                    </div>
                  ) : <span className="text-slate-300">-</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabMandiri({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    berat_badan: '',
    tinggi_badan: '',
    lingkar_perut: '',
    tensi: '',
    gula_darah: '',
    catatan: '',
  });
  // Nilai default null agar radio button belum terpilih
  const [tbc, setTbc] = useState<(boolean | null)[]>([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const gejalaPositif = tbc.filter(val => val === true).length;
  // Cek apakah semua baris sudah dijawab (tidak ada yang null)
  const isLengkap = tbc.every(val => val !== null);

  // Hitung IMT live
  const imt = form.berat_badan && form.tinggi_badan
    ? (parseFloat(form.berat_badan) / Math.pow(parseFloat(form.tinggi_badan) / 100, 2)).toFixed(1)
    : null;
  const kategoriIMT = imt
    ? parseFloat(imt) < 18.5 ? 'Kurus 🔵'
      : parseFloat(imt) < 25 ? 'Normal ✅'
      : parseFloat(imt) < 27 ? 'Overweight ⚠️'
      : 'Obesitas 🔴'
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLengkap) {
      alert("Harap jawab semua pertanyaan skrining (Ya / Tidak).");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/masyarakat/lapor-mandiri", {
        berat_badan:   form.berat_badan   ? parseFloat(form.berat_badan)   : null,
        tinggi_badan:  form.tinggi_badan  ? parseFloat(form.tinggi_badan)  : null,
        lingkar_perut: form.lingkar_perut ? parseFloat(form.lingkar_perut) : null,
        tensi:         form.tensi || null,
        gula_darah:    form.gula_darah    ? parseFloat(form.gula_darah)    : null,
        skrining_tbc:  tbc,
        catatan:       form.catatan || null,
      });
      setDone(true);
      onSuccess();
    } catch {
      alert("Gagal menyimpan data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDone(false);
    setForm({ berat_badan: '', tinggi_badan: '', lingkar_perut: '', tensi: '', gula_darah: '', catatan: '' });
    setTbc([null, null, null, null]);
  };

  if (done) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="font-bold text-slate-800">Laporan Mandiri berhasil disimpan!</p>
        <p className="text-sm text-slate-500">Terima kasih. Data ini sangat membantu Kader dan Bidan untuk memantau kesehatan Anda.</p>
        <button onClick={resetForm} className="text-sm text-blue-600 hover:underline mt-2">+ Lapor lagi</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Banner info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-800 text-sm">Laporan Pemeriksaan & Skrining Mandiri</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Isi hasil pengukuran Anda sendiri dan jawab pertanyaan skrining di bawah ini. Data ini akan memudahkan Kader dan Bidan saat Anda berkunjung ke Posyandu.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Bagian 1: Penimbangan & Pengukuran */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-5 h-5" /> Bagian 1: Penimbangan & Pengukuran
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Berat Badan (kg)</label>
              <input type="number" step="0.1" placeholder="cth: 65.5" value={form.berat_badan}
                onChange={e => setForm({ ...form, berat_badan: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tinggi Badan (cm)</label>
              <input type="number" step="0.1" placeholder="cth: 165" value={form.tinggi_badan}
                onChange={e => setForm({ ...form, tinggi_badan: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lingkar Perut (cm) <span className="text-slate-400 font-normal">opsional</span></label>
              <input type="number" step="0.1" placeholder="cth: 82" value={form.lingkar_perut}
                onChange={e => setForm({ ...form, lingkar_perut: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tensi Darah <span className="text-slate-400 font-normal">opsional</span></label>
              <input type="text" placeholder="cth: 120/80" value={form.tensi}
                onChange={e => setForm({ ...form, tensi: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gula Darah (mg/dL) <span className="text-slate-400 font-normal">opsional</span></label>
              <input type="number" placeholder="cth: 95" value={form.gula_darah}
                onChange={e => setForm({ ...form, gula_darah: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          {/* Live IMT preview */}
          {imt && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">IMT Anda (perhitungan otomatis)</p>
                <p className="text-2xl font-black text-slate-800">{imt} <span className="text-sm font-medium text-slate-500">kg/m²</span></p>
              </div>
              <span className="text-sm font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{kategoriIMT}</span>
            </div>
          )}
        </div>

        {/* Bagian 2: Skrining TBC (Tabel Ya/Tidak) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Bagian 2: Skrining TBC & Gejala Umum
            </p>
            <p className="text-xs text-slate-500 mt-1">Apakah Anda mengalami gejala berikut selama 2–4 minggu terakhir?</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-600 uppercase text-xs">Pertanyaan Skrining</th>
                  <th className="py-3 px-4 font-bold text-red-600 uppercase text-xs text-center w-24">Ya</th>
                  <th className="py-3 px-4 font-bold text-emerald-600 uppercase text-xs text-center w-24">Tidak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INDIKATOR_TBC.map((label, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-slate-700 font-medium">{label}</td>
                    <td className="py-4 px-4 text-center cursor-pointer" onClick={() => {
                        const next = [...tbc];
                        next[i] = true;
                        setTbc(next);
                      }}>
                      <input
                        type="radio"
                        name={`tbc-${i}`}
                        checked={tbc[i] === true}
                        readOnly
                        className="w-5 h-5 cursor-pointer accent-red-500 ring-0 focus:ring-0"
                      />
                    </td>
                    <td className="py-4 px-4 text-center cursor-pointer" onClick={() => {
                        const next = [...tbc];
                        next[i] = false;
                        setTbc(next);
                      }}>
                      <input
                        type="radio"
                        name={`tbc-${i}`}
                        checked={tbc[i] === false}
                        readOnly
                        className="w-5 h-5 cursor-pointer accent-emerald-500 ring-0 focus:ring-0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {gejalaPositif >= 2 && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Ada {gejalaPositif} gejala yang perlu diperhatikan. Segera konsultasikan ke Bidan.
            </div>
          )}
        </div>

        {/* Bagian 3: Catatan / Keluhan Bebas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-blue-500" /> Bagian 3: Keluhan Tambahan (Opsional)
          </p>
          <textarea rows={3} placeholder="Apakah ada keluhan kesehatan lain yang ingin Anda sampaikan? Tulis di sini..."
            value={form.catatan}
            onChange={e => setForm({ ...form, catatan: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none" />
        </div>

        <button type="submit" disabled={submitting || !isLengkap}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-md shadow-blue-200">
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim Laporan...</>
            : <><Send className="w-4 h-4" />Kirim Laporan Mandiri</>}
        </button>
      </form>
    </div>
  );
}

export default function RiwayatPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get("/masyarakat/riwayat")
      .then(res => setData(res.data.data ?? []))
      .catch(err => console.error("Failed to load riwayat", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const TABS: { key: Tab; label: string; icon: any; activeCls: string }[] = [
    { key: "semua",       label: "Semua Kunjungan",      icon: ClipboardList, activeCls: "bg-slate-700 text-white shadow-slate-300" },
    { key: "penimbangan", label: "Penimbangan & Ukur",   icon: Scale,         activeCls: "bg-blue-600 text-white shadow-blue-200" },
    { key: "tbc",         label: "Skrining TBC",         icon: ShieldAlert,   activeCls: "bg-amber-500 text-white shadow-amber-200" },
    { key: "pelayanan",   label: "Pelayanan Kesehatan",  icon: Stethoscope,   activeCls: "bg-emerald-600 text-white shadow-emerald-200" },
    { key: "mandiri",     label: "+ Lapor Mandiri",      icon: Plus,          activeCls: "bg-violet-600 text-white shadow-violet-200" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Riwayat Layanan Posyandu</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Rekam medis ILP per kunjungan &bull; {data.length} kunjungan tercatat</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 shadow-sm ${isActive ? `${tab.activeCls} shadow-md` : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Memuat riwayat layanan...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {activeTab === "mandiri" && <TabMandiri onSuccess={fetchData} />}

            {activeTab === "penimbangan" && (data.length === 0 ? <EmptyState label="Belum ada data penimbangan." /> : <TabPenimbangan data={data} />)}

            {activeTab === "tbc" && (data.length === 0 ? <EmptyState label="Belum ada data skrining TBC." /> : <TabSkringingTBC data={data} />)}

            {activeTab === "pelayanan" && (data.length === 0 ? <EmptyState label="Belum ada data pelayanan kesehatan." /> : <TabPelayanan data={data} />)}

            {activeTab === "semua" && (
              data.length === 0 ? <EmptyState label="Belum ada riwayat layanan Posyandu." /> : (
                <div className="space-y-3">
                  {data.map(row => {
                    const isExpanded = expandedId === row.id;
                    return (
                      <div key={row.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button onClick={() => setExpandedId(isExpanded ? null : row.id)}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                              {new Date(row.tanggal).toLocaleString("id-ID", { month: "short" })}
                            </span>
                            <span className="text-lg font-black text-slate-800 leading-tight">
                              {new Date(row.tanggal).getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-800 text-sm">{row.posyandu}</p>
                              {row.sumber === "mandiri" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">Mandiri</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{row.tanggal_label}</p>
                            <div className="flex gap-2 mt-1.5 flex-wrap">
                              {row.penimbangan?.berat_badan && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">BB {row.penimbangan.berat_badan} kg</span>}
                              {row.penimbangan?.tinggi_badan && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">TB {row.penimbangan.tinggi_badan} cm</span>}
                              {row.pelayanan?.tensi && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">Tensi {row.pelayanan.tensi}</span>}
                              <BadgeHasil hasil={row.skrining_tbc?.hasil ?? "Negatif"} />
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 space-y-1.5">
                                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" />Penimbangan & Ukur</p>
                                  {[
                                    { label: "BB", val: row.penimbangan?.berat_badan, unit: "kg" },
                                    { label: "TB/PB", val: row.penimbangan?.tinggi_badan, unit: "cm" },
                                    { label: "L. Kepala", val: row.penimbangan?.lingkar_kepala, unit: "cm" },
                                    { label: "L. Perut", val: row.penimbangan?.lingkar_perut, unit: "cm" },
                                    { label: "LiLA", val: row.penimbangan?.lila, unit: "cm" },
                                    { label: "IMT", val: row.penimbangan?.imt },
                                    { label: "Status Gizi", val: row.penimbangan?.status_gizi },
                                    { label: "Imunisasi", val: row.penimbangan?.imunisasi },
                                    { label: "Vitamin", val: row.penimbangan?.vitamin },
                                  ].filter(r => r.val !== null && r.val !== undefined).map(r => (
                                    <div key={r.label} className="flex justify-between text-xs">
                                      <span className="text-slate-500">{r.label}</span>
                                      <span className="font-semibold text-slate-700">{r.val}{r.unit ? ` ${r.unit}` : ""}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 space-y-1.5">
                                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3 h-3" />Skrining TBC</p>
                                  {INDIKATOR_TBC.map((ind, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      {row.skrining_tbc?.detail?.[i]
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                        : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                                      <span className={row.skrining_tbc?.detail?.[i] ? "text-red-700 font-semibold" : "text-slate-500"}>{ind}</span>
                                    </div>
                                  ))}
                                  <div className="pt-1 border-t border-amber-100">
                                    <BadgeHasil hasil={row.skrining_tbc?.hasil ?? "Negatif"} />
                                  </div>
                                </div>
                                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 space-y-1.5">
                                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1"><Stethoscope className="w-3 h-3" />Pelayanan Kesehatan</p>
                                  {[
                                    { label: "Tensi", val: row.pelayanan?.tensi },
                                    { label: "Gula Darah", val: row.pelayanan?.gula_darah, unit: "mg/dL" },
                                    { label: "Uk. Kandungan", val: row.pelayanan?.usia_kandungan, unit: "mgg" },
                                    { label: "Skor AKS", val: row.pelayanan?.aks_score },
                                  ].filter(r => r.val !== null && r.val !== undefined).map(r => (
                                    <div key={r.label} className="flex justify-between text-xs">
                                      <span className="text-slate-500">{r.label}</span>
                                      <span className="font-semibold text-slate-700">{r.val}{r.unit ? ` ${r.unit}` : ""}</span>
                                    </div>
                                  ))}
                                  {row.pelayanan?.catatan && (
                                    <div className="pt-1 border-t border-emerald-100">
                                      <p className="text-[10px] text-slate-500 font-medium">Catatan Bidan</p>
                                      <p className="text-xs text-slate-700 mt-0.5 leading-snug">{row.pelayanan.catatan}</p>
                                    </div>
                                  )}
                                  {row.pelayanan?.dirujuk && (
                                    <div className="pt-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Dirujuk: {row.pelayanan.alasan_rujukan}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

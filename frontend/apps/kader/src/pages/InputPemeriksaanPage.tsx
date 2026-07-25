import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Scale, AlertTriangle } from "lucide-react";
import api from "../lib/api";

export default function InputPemeriksaanPage() {
  const { antrian_id } = useParams();
  const navigate = useNavigate();
  
  const [antrian, setAntrian] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    berat_badan: "",
    tinggi_badan: "",
    lingkar_kepala: "",
    lingkar_perut: "",
    lila: "",
    tensi: "",
    gula_darah: ""
  });

  // State khusus Lansia
  const [lansiaSkrining, setLansiaSkrining] = useState({
    aks: "Mandiri", // Mandiri, Bantuan Ringan, Bantuan Sedang, Ketergantungan
    kognitif: "Tidak", // Tidak bermasalah
    gerak: "Tidak",
    malnutrisi: "Tidak",
    pendengaran: "Tidak",
    penglihatan: "Tidak",
    depresi: "Tidak"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resJadwal = await api.get('/kader/jadwal/aktif');
        if (resJadwal.data.data && resJadwal.data.data.length > 0) {
          const j = resJadwal.data.data[0];
          const resAntrian = await api.get(`/kader/antrian?jadwal_id=${j.id}`);
          const found = resAntrian.data.data.find((a: any) => a.id.toString() === antrian_id);
          if (found) {
            setAntrian(found);
          } else {
            alert("Data antrian tidak ditemukan.");
            navigate('/pelaksanaan');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [antrian_id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/kader/pengukuran', {
        antrian_id,
        berat_badan: formData.berat_badan || null,
        tinggi_badan: formData.tinggi_badan || null,
        lingkar_kepala: formData.lingkar_kepala || null,
        lingkar_perut: formData.lingkar_perut || null,
        lila: formData.lila || null,
        tensi: formData.tensi || null,
        gula_darah: formData.gula_darah || null,
        skrining_lansia: isLansiaDewasa ? lansiaSkrining : null
      });
      alert("Pengukuran berhasil disimpan!");
      navigate('/pelaksanaan');
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const isBalita = antrian?.jenis_layanan?.toLowerCase().includes('balita');
  const isIbuHamil = antrian?.jenis_layanan?.toLowerCase().includes('hamil');
  const isLansiaDewasa = antrian?.jenis_layanan?.toLowerCase().includes('lansia') || antrian?.jenis_layanan?.toLowerCase().includes('dewasa') || antrian?.jenis_layanan?.toLowerCase().includes('produktif');
  const isLansiaOnly = antrian?.jenis_layanan?.toLowerCase().includes('lansia');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm dark:shadow-none flex items-center gap-4">
        <Link to="/pelaksanaan" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Input Pemeriksaan</h1>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Meja 2 - Cepat & Praktis</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 mt-4">
        
        {antrian && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-2xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{antrian.user?.name}</h2>
                <p className="text-sm text-slate-500">{antrian.jenis_layanan}</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-400 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              Ingat: Jangan lupa tuliskan angka yang sama di Buku KIA/KMS warga setelah klik simpan.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BAGIAN 1: PENGUKURAN ANGKA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Hasil Pengukuran Angka</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Berat Badan (Kg)</label>
                <input type="number" step="0.1" required value={formData.berat_badan} onChange={e=>setFormData({...formData, berat_badan: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tinggi Badan (cm)</label>
                <input type="number" step="0.1" required value={formData.tinggi_badan} onChange={e=>setFormData({...formData, tinggi_badan: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
              </div>
            </div>

            {isBalita && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Lingkar Kepala (cm)</label>
                <input type="number" step="0.1" value={formData.lingkar_kepala} onChange={e=>setFormData({...formData, lingkar_kepala: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
              </div>
            )}

            {isIbuHamil && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Lingkar Lengan Atas / LILA (cm)</label>
                <input type="number" step="0.1" value={formData.lila} onChange={e=>setFormData({...formData, lila: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
              </div>
            )}

            {isLansiaDewasa && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Lingkar Perut (cm)</label>
                    <input type="number" step="0.1" value={formData.lingkar_perut} onChange={e=>setFormData({...formData, lingkar_perut: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tensi (Mis: 120/80)</label>
                    <input type="text" value={formData.tensi} onChange={e=>setFormData({...formData, tensi: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="120/80" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Gula Darah (mg/dL)</label>
                  <input type="number" step="0.1" value={formData.gula_darah} onChange={e=>setFormData({...formData, gula_darah: e.target.value})} className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" placeholder="0.0" />
                </div>
              </>
            )}
          </div>

          {/* BAGIAN 2: SKRINING LANSIA (TAP-TAP) */}
          {isLansiaOnly && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Kemandirian & SKILAS (Tanpa Ketik)</h3>
              <p className="text-xs text-slate-500 mb-6">Sentuh tombol yang sesuai dengan hasil wawancara Mbah.</p>

              {/* Kemandirian (AKS) */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Tingkat Kemandirian (AKS)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Mandiri", "Bantuan Ringan", "Bantuan Sedang", "Bergantung Total"].map((opt) => (
                    <button 
                      key={opt}
                      type="button"
                      onClick={() => setLansiaSkrining({...lansiaSkrining, aks: opt})}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${lansiaSkrining.aks === opt 
                        ? (opt === 'Mandiri' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 
                           opt === 'Bergantung Total' ? 'bg-rose-100 border-rose-500 text-rose-700' : 
                           'bg-amber-100 border-amber-500 text-amber-700')
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* SKILAS Toggles */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Pemeriksaan SKILAS</label>
                
                {[
                  { key: 'kognitif', label: 'Daya Ingat / Kognitif' },
                  { key: 'gerak', label: 'Masalah Bergerak / Jatuh' },
                  { key: 'malnutrisi', label: 'Kekurangan Gizi / Kurus' },
                  { key: 'pendengaran', label: 'Masalah Pendengaran' },
                  { key: 'penglihatan', label: 'Masalah Penglihatan' },
                  { key: 'depresi', label: 'Terlihat Sedih / Depresi' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <div className="flex bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => setLansiaSkrining({...lansiaSkrining, [item.key]: 'Tidak'})}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${lansiaSkrining[item.key as keyof typeof lansiaSkrining] === 'Tidak' 
                          ? 'bg-emerald-500 text-white' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        NORMAL
                      </button>
                      <button 
                        type="button"
                        onClick={() => setLansiaSkrining({...lansiaSkrining, [item.key]: 'Ya'})}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${lansiaSkrining[item.key as keyof typeof lansiaSkrining] === 'Ya' 
                          ? 'bg-rose-500 text-white' 
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        MASALAH
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors">
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan & Selesai</>}
          </button>
        </form>

      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Save, Download, Printer } from "lucide-react";
import api from "../lib/api";

// Warna kartu tiap grup (untuk membantu kader membedakan seksi)
type GroupColor = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'orange' | 'indigo';

const PWS_CONFIG: Record<string, {title: string, color: GroupColor, fields: {key: string, label: string}[]}[]> = {

  // ─── BUKU 1: BAYI, BALITA & APRAS ──────────────────────────────────────────
  "Bayi, Balita & Apras (0-71 Bulan)": [
    {
      title: "KEHADIRAN SASARAN",
      color: "blue",
      fields: [
        { key: "SASARAN_BAYI",    label: "Sasaran Bayi (0-11 bln)" },
        { key: "SASARAN_BALITA",  label: "Sasaran Balita (12-59 bln)" },
        { key: "SASARAN_APRAS",   label: "Sasaran Apras (60-71 bln)" },
        { key: "DATANG",          label: "Datang / Hadir" },
        { key: "TIDAK_DATANG",    label: "Tidak Datang" },
      ]
    },
    {
      title: "STATUS GIZI BB/U (Berat Badan / Umur)",
      color: "emerald",
      fields: [
        { key: "BBU_SK",  label: "Sangat Kurang (SK)" },
        { key: "BBU_K",   label: "Kurang (K)" },
        { key: "BBU_N",   label: "Normal (N)" },
        { key: "BBU_L",   label: "Lebih (L)" },
      ]
    },
    {
      title: "STATUS TINGGI BADAN PB/TB/U",
      color: "violet",
      fields: [
        { key: "PBTBU_SP",  label: "Sangat Pendek (SP)" },
        { key: "PBTBU_P",   label: "Pendek (P)" },
        { key: "PBTBU_N",   label: "Normal (N)" },
        { key: "PBTBU_T",   label: "Tinggi (T)" },
      ]
    },
    {
      title: "STATUS GIZI BB/PB ATAU BB/TB",
      color: "amber",
      fields: [
        { key: "BBPB_GBU",  label: "Gizi Buruk (GBU)" },
        { key: "BBPB_GK",   label: "Gizi Kurang (GK)" },
        { key: "BBPB_GB",   label: "Gizi Baik (GB)" },
        { key: "BBPB_BGL",  label: "Berisiko Gizi Lebih (BGL)" },
        { key: "BBPB_GL",   label: "Gizi Lebih (GL)" },
        { key: "BBPB_OB",   label: "Obesitas (OB)" },
      ]
    },
    {
      title: "LAYANAN LAINNYA",
      color: "cyan",
      fields: [
        { key: "IMUNISASI_DASAR",  label: "Imunisasi Dasar Lengkap" },
        { key: "VITAMIN_A",        label: "Mendapat Vitamin A" },
        { key: "OBAT_CACING",      label: "Mendapat Obat Cacing" },
      ]
    },
  ],

  // ─── BUKU 2: IBU HAMIL, NIFAS & MENYUSUI ───────────────────────────────────
  "Ibu Hamil, Nifas & Menyusui": [
    {
      title: "KEHADIRAN SASARAN",
      color: "rose",
      fields: [
        { key: "SASARAN_BUMIL",  label: "Sasaran Ibu Hamil (Bumil)" },
        { key: "SASARAN_BUFAS",  label: "Sasaran Ibu Nifas (Bufas)" },
        { key: "SASARAN_BUSUI",  label: "Sasaran Ibu Menyusui (Busui)" },
        { key: "DATANG_BUMIL",   label: "Bumil Datang" },
        { key: "DATANG_BUFAS",   label: "Bufas/Busui Datang" },
        { key: "TIDAK_DATANG",   label: "Total Tidak Datang" },
      ]
    },
    {
      title: "HASIL PEMERIKSAAN BERAT BADAN (BUMIL)",
      color: "amber",
      fields: [
        { key: "BB_NAIK",    label: "Naik" },
        { key: "BB_TIDAK",   label: "Tidak Naik" },
      ]
    },
    {
      title: "LINGKAR LENGAN ATAS (LILA)",
      color: "emerald",
      fields: [
        { key: "LILA_H",     label: "Hijau (H)" },
        { key: "LILA_K",     label: "Kuning (K)" },
        { key: "LILA_M_KEK", label: "Merah / KEK (M/KEK)" },
      ]
    },
    {
      title: "SKRINING HIPERTENSI",
      color: "violet",
      fields: [
        { key: "TD_R",   label: "Rendah (R)" },
        { key: "TD_N",   label: "Normal (N)" },
        { key: "TD_T",   label: "Tinggi (T)" },
      ]
    },
    {
      title: "TABLET TAMBAH DARAH (TTD)",
      color: "blue",
      fields: [
        { key: "TTD_SETIAP_HARI",  label: "Konsumsi Setiap Hari" },
        { key: "TTD_TIDAK",        label: "Tidak Konsumsi" },
      ]
    },
    {
      title: "PMT & IMUNISASI",
      color: "cyan",
      fields: [
        { key: "PMT_BUMIL",        label: "Ibu Hamil Dapat PMT" },
        { key: "BUMIL_KELAS",      label: "Ikut Kelas Ibu Hamil" },
        { key: "VITAMIN_A_BUFAS",  label: "Bufas Dapat Vitamin A" },
        { key: "IMUNISASI_TT",     label: "Imunisasi TT (Tetanus)" },
        { key: "EDUKASI",          label: "Mendapat Edukasi" },
      ]
    },
  ],

  // ─── BUKU 3: ANAK SEKOLAH & REMAJA ─────────────────────────────────────────
  "Anak Sekolah & Remaja (6-18 Tahun)": [
    {
      title: "KEHADIRAN SASARAN",
      color: "blue",
      fields: [
        { key: "SASARAN_6_14",    label: "Sasaran Usia 6-14 Thn" },
        { key: "SASARAN_15_18",   label: "Sasaran Usia 15-18 Thn" },
        { key: "DATANG_6_14",     label: "Datang 6-14 Thn" },
        { key: "DATANG_15_18",    label: "Datang 15-18 Thn" },
        { key: "TIDAK_DATANG_6_14",   label: "Tidak Datang 6-14 Thn" },
        { key: "TIDAK_DATANG_15_18",  label: "Tidak Datang 15-18 Thn" },
      ]
    },
    {
      title: "IMT (Indeks Massa Tubuh) — Skrining Obesitas",
      color: "amber",
      fields: [
        { key: "IMT_SK",   label: "Sangat Kurus (SK)" },
        { key: "IMT_K",    label: "Kurus (K)" },
        { key: "IMT_N",    label: "Normal (N)" },
        { key: "IMT_G",    label: "Gemuk (G)" },
        { key: "IMT_OB",   label: "Obesitas (OB)" },
      ]
    },
    {
      title: "LINGKAR PERUT",
      color: "orange",
      fields: [
        { key: "LP_P80",   label: "Perempuan >80 cm" },
        { key: "LP_L90",   label: "Laki-laki >90 cm" },
      ]
    },
    {
      title: "TEKANAN DARAH",
      color: "rose",
      fields: [
        { key: "TD_RENDAH",  label: "Rendah" },
        { key: "TD_NORMAL",  label: "Normal" },
        { key: "TD_TINGGI",  label: "Tinggi" },
      ]
    },
    {
      title: "GULA DARAH",
      color: "violet",
      fields: [
        { key: "GD_RENDAH",  label: "Rendah" },
        { key: "GD_NORMAL",  label: "Normal" },
        { key: "GD_TINGGI",  label: "Tinggi" },
      ]
    },
    {
      title: "REMAJA PUTRI (≥15 Tahun)",
      color: "cyan",
      fields: [
        { key: "REMTRI_ANEMIA",    label: "Terdeteksi Anemia" },
        { key: "REMTRI_TDK_ANEMIA",label: "Tidak Anemia" },
      ]
    },
    {
      title: "SKRINING LAINNYA",
      color: "emerald",
      fields: [
        { key: "TBC_GEJALA",   label: "Bergejala TBC" },
        { key: "EDUKASI",      label: "Mendapat Edukasi" },
        { key: "DIRUJUK",      label: "Dirujuk ke Fasilitas" },
      ]
    },
  ],

  // ─── BUKU 4: USIA DEWASA & LANSIA ──────────────────────────────────────────
  "Usia Dewasa & Lansia (≥19 Tahun)": [
    {
      title: "KEHADIRAN SASARAN",
      color: "blue",
      fields: [
        { key: "SASARAN_DEWASA",   label: "Sasaran Usia Dewasa" },
        { key: "SASARAN_LANSIA",   label: "Sasaran Usia Lansia (≥60)" },
        { key: "DATANG_DEWASA",    label: "Dewasa Datang" },
        { key: "DATANG_LANSIA",    label: "Lansia Datang" },
        { key: "TIDAK_DATANG",     label: "Total Tidak Datang" },
      ]
    },
    {
      title: "IMT (Indeks Massa Tubuh)",
      color: "amber",
      fields: [
        { key: "IMT_SK",    label: "Sangat Kurus (SK)" },
        { key: "IMT_K",     label: "Kurus (K)" },
        { key: "IMT_N",     label: "Normal (N)" },
        { key: "IMT_G",     label: "Gemuk (G)" },
        { key: "IMT_OB",    label: "Obesitas (OB)" },
      ]
    },
    {
      title: "LINGKAR PERUT (USIA DEWASA)",
      color: "orange",
      fields: [
        { key: "LP_P80",    label: "Perempuan >80 cm" },
        { key: "LP_L90",    label: "Laki-laki >90 cm" },
        { key: "LP_PEMERIKSAAN",  label: "Yang Diperiksa LP" },
      ]
    },
    {
      title: "TEKANAN DARAH",
      color: "rose",
      fields: [
        { key: "TD_RENDAH",   label: "Rendah" },
        { key: "TD_NORMAL",   label: "Normal" },
        { key: "TD_TINGGI",   label: "Tinggi" },
      ]
    },
    {
      title: "GULA DARAH",
      color: "violet",
      fields: [
        { key: "GD_RENDAH",   label: "Rendah" },
        { key: "GD_NORMAL",   label: "Normal" },
        { key: "GD_TINGGI",   label: "Tinggi" },
      ]
    },
    {
      title: "SKRINING PUMA / PPOK (Paru)",
      color: "indigo",
      fields: [
        { key: "PUMA_KAT_A",   label: "Kategori A (Normal)" },
        { key: "PUMA_KAT_B",   label: "Kategori B" },
        { key: "PUMA_KAT_C",   label: "Kategori C" },
      ]
    },
    {
      title: "TINGKAT KETERGANTUNGAN LANSIA — AKS (SKILAS)",
      color: "cyan",
      fields: [
        { key: "AKS_MANDIRI",       label: "Mandiri" },
        { key: "AKS_BERGANTUNG",    label: "Bergantung Sebagian" },
        { key: "AKS_TOTAL",         label: "Total / Tidur" },
      ]
    },
    {
      title: "SKRINING LANSIA SEDERHANA (SKILAS)",
      color: "emerald",
      fields: [
        { key: "SKILAS_KOGNITIF_YA",    label: "Kognitif: Bermasalah (Ya)" },
        { key: "SKILAS_GERAK_YA",       label: "Gerak: Bermasalah (Ya)" },
        { key: "SKILAS_MALNUTRISI_YA",  label: "Malnutrisi: Ya" },
        { key: "SKILAS_PENDENGARAN_YA", label: "Pendengaran: Bermasalah" },
        { key: "SKILAS_PENGLIHATAN_YA", label: "Penglihatan: Bermasalah" },
        { key: "SKILAS_DEPRESI_YA",     label: "Depresi: Ya" },
      ]
    },
    {
      title: "IMUNISASI & EDUKASI LANSIA",
      color: "indigo",
      fields: [
        { key: "IMUNISASI_COVID",   label: "Imunisasi COVID-19" },
        { key: "EDUKASI",           label: "Mendapat Edukasi" },
        { key: "DIRUJUK",           label: "Dirujuk ke Fasilitas" },
      ]
    },
  ],

  // ─── TAMBAHAN: IBU MENYUSUI (BUSUI) — terpisah ─────────────────────────────
  "Ibu Menyusui / Busui": [
    {
      title: "KEHADIRAN SASARAN BUSUI",
      color: "rose",
      fields: [
        { key: "SASARAN_BUSUI",    label: "Jumlah Sasaran Busui" },
        { key: "DATANG_BUSUI",     label: "Busui Datang / Hadir" },
        { key: "TIDAK_DATANG",     label: "Tidak Datang" },
      ]
    },
    {
      title: "STATUS GIZI IBU MENYUSUI (LILA)",
      color: "emerald",
      fields: [
        { key: "LILA_NORMAL",   label: "LILA Normal (≥23,5 cm)" },
        { key: "LILA_KEK",      label: "LILA KEK / Kurang (<23,5 cm)" },
      ]
    },
    {
      title: "PEMBERIAN ASI",
      color: "blue",
      fields: [
        { key: "ASI_EKSKLUSIF",    label: "ASI Eksklusif (0-6 bln)" },
        { key: "ASI_LANJUTAN",     label: "ASI Lanjutan (6-24 bln)" },
        { key: "TIDAK_ASI",        label: "Tidak Menyusui" },
      ]
    },
    {
      title: "LAYANAN YANG DITERIMA",
      color: "cyan",
      fields: [
        { key: "PMT_BUSUI",       label: "Mendapat PMT Busui" },
        { key: "VITAMIN_A",       label: "Mendapat Vitamin A" },
        { key: "KONSELING_LAKTASI", label: "Konseling Laktasi / Menyusui" },
        { key: "EDUKASI",         label: "Mendapat Edukasi Gizi" },
      ]
    },
    {
      title: "TEKANAN DARAH",
      color: "violet",
      fields: [
        { key: "TD_RENDAH",  label: "Rendah" },
        { key: "TD_NORMAL",  label: "Normal" },
        { key: "TD_TINGGI",  label: "Tinggi / Hipertensi" },
      ]
    },
  ],

  // ─── TAMBAHAN: LANSIA — terpisah (sesuai spreadsheet PWS Posyandu) ───────────
  "Lansia (≥60 Tahun)": [
    {
      title: "KEHADIRAN SASARAN LANSIA",
      color: "blue",
      fields: [
        { key: "SASARAN_LANSIA",   label: "Jumlah Sasaran Lansia" },
        { key: "DATANG_LANSIA",    label: "Lansia Datang / Hadir" },
        { key: "TIDAK_DATANG",     label: "Tidak Datang" },
      ]
    },
    {
      title: "SKRINING OBESITAS — IMT (Indeks Massa Tubuh)",
      color: "amber",
      fields: [
        { key: "IMT_SK",   label: "Sangat Kurus (SK)" },
        { key: "IMT_K",    label: "Kurus (K)" },
        { key: "IMT_N",    label: "Normal (N)" },
        { key: "IMT_G",    label: "Gemuk (G)" },
        { key: "IMT_OB",   label: "Obesitas (OB)" },
      ]
    },
    {
      title: "SKRINING HIPERTENSI — Tekanan Darah",
      color: "rose",
      fields: [
        { key: "TD_RENDAH",   label: "Rendah (R)" },
        { key: "TD_NORMAL",   label: "Normal (N)" },
        { key: "TD_TINGGI",   label: "Tinggi / Hipertensi (T)" },
      ]
    },
    {
      title: "SKRINING DIABETES — Gula Darah",
      color: "violet",
      fields: [
        { key: "GD_RENDAH",   label: "Rendah (R)" },
        { key: "GD_NORMAL",   label: "Normal (N)" },
        { key: "GD_TINGGI",   label: "Tinggi / DM (T)" },
      ]
    },
    {
      title: "TINGKAT KEMANDIRIAN (AKS) DALAM ANGKA",
      color: "cyan",
      fields: [
        { key: "AKS_M",   label: "Mandiri (M)" },
        { key: "AKS_B",   label: "Bantuan Ringan (B)" },
        { key: "AKS_S",   label: "Bantuan Sedang (S)" },
        { key: "AKS_T",   label: "Ketergantungan Total (T)" },
      ]
    },
    {
      title: "SKRINING LANSIA SEDERHANA (SKILAS)",
      color: "indigo",
      fields: [
        { key: "SKILAS_KOG_YA",    label: "Gangguan Kognitif (YA)" },
        { key: "SKILAS_KOG_TIDAK", label: "Gangguan Kognitif (TIDAK)" },
        { key: "SKILAS_GRK_YA",    label: "Gangguan Gerak (YA)" },
        { key: "SKILAS_GRK_TIDAK", label: "Gangguan Gerak (TIDAK)" },
        { key: "SKILAS_MAL_YA",    label: "Malnutrisi (YA)" },
        { key: "SKILAS_MAL_TIDAK", label: "Malnutrisi (TIDAK)" },
        { key: "SKILAS_PDG_YA",    label: "Gangguan Pendengaran (YA)" },
        { key: "SKILAS_PDG_TIDAK", label: "Gangguan Pendengaran (TIDAK)" },
        { key: "SKILAS_PLH_YA",    label: "Gangguan Penglihatan (YA)" },
        { key: "SKILAS_PLH_TIDAK", label: "Gangguan Penglihatan (TIDAK)" },
        { key: "SKILAS_DEP_YA",    label: "Gejala Depresi (YA)" },
        { key: "SKILAS_DEP_TIDAK", label: "Gejala Depresi (TIDAK)" },
      ]
    },
    {
      title: "IMUNISASI & EDUKASI",
      color: "blue",
      fields: [
        { key: "IMUNISASI_COVID",  label: "Imunisasi COVID-19" },
        { key: "EDUKASI",          label: "Mendapat Edukasi" },
        { key: "DIRUJUK",          label: "Dirujuk ke Fasilitas" },
      ]
    },
  ],
};

const GROUP_COLOR_MAP: Record<GroupColor, { card: string; title: string; dot: string }> = {
  blue:   { card: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50',     title: 'text-blue-800 dark:text-blue-300',   dot: 'bg-blue-500' },
  emerald:{ card: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50', title: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  violet: { card: 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50', title: 'text-violet-800 dark:text-violet-300', dot: 'bg-violet-500' },
  amber:  { card: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50',   title: 'text-amber-800 dark:text-amber-300',   dot: 'bg-amber-500' },
  rose:   { card: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50',     title: 'text-rose-800 dark:text-rose-300',     dot: 'bg-rose-500' },
  cyan:   { card: 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800/50',     title: 'text-cyan-800 dark:text-cyan-300',     dot: 'bg-cyan-500' },
  orange: { card: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50', title: 'text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
  indigo: { card: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50', title: 'text-indigo-800 dark:text-indigo-300', dot: 'bg-indigo-500' },
};


export default function LaporanPwsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    kategori: "Bayi, Balita & Apras (0-71 Bulan)",
    bulan: new Date().toLocaleString('id-ID', { month: 'long' }),
    tahun: new Date().getFullYear(),
  });

  const [pwsData, setPwsData] = useState<any>({});

  const handleKategoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({...form, kategori: e.target.value});
    setPwsData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwsData({ ...pwsData, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/kader/laporan/pws", {
        kategori: form.kategori,
        bulan: form.bulan.toString(),
        tahun: form.tahun,
        data: pwsData,
      });

      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = PWS_CONFIG[form.kategori] || [];

  const handleExportExcel = () => {
    const headers = ["Grup", "Indikator", "Nilai"];
    const rows: string[] = [];
    
    activeConfig.forEach(group => {
      group.fields.forEach(field => {
        rows.push(`"${group.title}","${field.label}","${pwsData[field.key] || 0}"`);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8,Bulan:, " + form.bulan + "\nTahun:, " + form.tahun + "\nKategori:, " + form.kategori + "\n\n" + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `form_pws_${form.kategori}_${form.bulan}_${form.tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm dark:shadow-none flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors print:hidden">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Input PWS Digital</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rekapitulasi Laporan Bulanan</p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button type="button" onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <Download className="w-3.5 h-3.5" /> Unduh Excel
          </button>
          <button type="button" onClick={handlePrintPdf} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            <Printer className="w-3.5 h-3.5" /> Cetak PDF
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        {done ? (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 text-center mt-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Berhasil Tersimpan!</h2>
            <p className="text-emerald-700 font-medium">Angka PWS berhasil dikirim dan akan otomatis direkapitulasi oleh Admin.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategori Laporan</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                  value={form.kategori}
                  onChange={handleKategoriChange}
                >
                  {Object.keys(PWS_CONFIG).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bulan</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                    value={form.bulan}
                    onChange={(e) => setForm({...form, bulan: e.target.value})}
                  >
                    {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tahun</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                    value={form.tahun}
                    onChange={(e) => setForm({...form, tahun: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Silakan masukkan angka rekap akhir dari buku posyandu Anda sesuai dengan form PWS.</p>
              </div>

              <div className="space-y-4">
                {activeConfig.map((group, idx) => {
                  const colors = GROUP_COLOR_MAP[group.color] || GROUP_COLOR_MAP.blue;
                  return (
                  <div key={idx} className={`border rounded-2xl p-5 ${colors.card}`}>
                    <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-current/10">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
                      <h3 className={`font-black text-sm tracking-wide uppercase ${colors.title}`}>{group.title}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {group.fields.map(field => (
                        <div key={field.key}>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase truncate">{field.label}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              name={field.key}
                              min="0"
                              className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-100 text-lg focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                              value={pwsData[field.key] || ""}
                              onChange={handleChange}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>

            </div>


            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors print:hidden"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan Laporan</>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

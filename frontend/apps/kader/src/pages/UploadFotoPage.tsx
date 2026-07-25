import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, CheckCircle2, Loader2, Camera as CameraIcon, X } from "lucide-react";
import api from "../lib/api";

export default function UploadFotoPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    kategori: "Balita",
    bulan: new Date().toLocaleString('id-ID', { month: 'long' }),
    tahun: new Date().getFullYear(),
    catatan: "",
  });

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(dataUrl);
        
        // Convert base64 to File object
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const f = new File([blob], `laporan-${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(f);
          });
          
        closeCamera();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Pilih foto terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("kategori", form.kategori);
      formData.append("bulan", form.bulan.toString());
      formData.append("tahun", form.tahun.toString());
      formData.append("catatan", form.catatan);
      formData.append("foto", file);

      await api.post("/kader/laporan/foto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDone(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      alert("Gagal mengunggah laporan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm dark:shadow-none flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Upload Foto Register</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kirim laporan manual ke Admin</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 mt-6">
        {done ? (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 text-center mt-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Berhasil Terkirim!</h2>
            <p className="text-emerald-700 font-medium">Foto register manual Anda berhasil dikirim ke Admin untuk diverifikasi.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategori Sasaran Laporan</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:ring-violet-500 outline-none"
                  value={form.kategori}
                  onChange={(e) => setForm({...form, kategori: e.target.value})}
                >
                  <option value="Balita">Balita & Apras</option>
                  <option value="Lansia">Lansia</option>
                  <option value="Usia Produktif">Usia Produktif</option>
                  <option value="Anak Sekolah & Remaja">Anak Sekolah & Remaja</option>
                  <option value="Bumil & Busui">Bumil & Busui</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bulan</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:ring-violet-500 outline-none"
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
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:ring-violet-500 outline-none"
                    value={form.tahun}
                    onChange={(e) => setForm({...form, tahun: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Foto Buku/Register (Maks 5MB)</label>
                
                {preview ? (
                  <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-2xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => openCamera()}
                      className="flex flex-col items-center justify-center h-48 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2 text-center"
                    >
                      <CameraIcon className="w-8 h-8 text-violet-500 mb-2" />
                      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">Kamera SIPO</span>
                      <p className="text-[10px] text-slate-400 mt-1">Foto langsung (Shopee Style)</p>
                    </div>

                    <label className="flex flex-col items-center justify-center h-48 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2 text-center">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const selectedFile = e.target.files[0];
                            setFile(selectedFile);
                            
                            if (selectedFile.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setPreview(event.target?.result as string);
                              };
                              reader.readAsDataURL(selectedFile);
                            } else {
                              // For non-images (like PDF), just show a generic preview
                              setPreview("https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg");
                            }
                          }
                        }} 
                      />
                      <UploadCloud className="w-8 h-8 text-emerald-500 mb-2" />
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">File / Galeri</span>
                      <p className="text-[10px] text-slate-400 mt-1">Pilih dari memori HP</p>
                    </label>
                  </div>
                )}
                
                {preview && (
                  <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="text-sm font-semibold text-red-500 mt-2 hover:underline flex justify-center w-full">
                    Hapus / Pilih Ulang
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Catatan Tambahan (Opsional)</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:ring-violet-500 outline-none min-h-[100px]"
                  placeholder="Misal: Data Lansia hari ini ada 1 lembar yang kelewatan..."
                  value={form.catatan}
                  onChange={(e) => setForm({...form, catatan: e.target.value})}
                ></textarea>
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading || !file}
              className="w-full mt-8 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><UploadCloud className="w-6 h-6" /> Kirim Foto ke Admin</>}
            </button>
          </form>
        )}
      </main>

      {/* Fullscreen Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/50 absolute top-0 left-0 right-0 z-10">
            <h3 className="text-white font-bold">Ambil Foto Dokumen</h3>
            <button onClick={closeCamera} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            ></video>
            
            {/* Guide overlay */}
            <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none"></div>
            
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          
          <div className="bg-black pb-12 pt-6 px-6 flex justify-center items-center">
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center hover:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

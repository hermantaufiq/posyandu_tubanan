import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Heart, Users, Activity, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const spmServices = [
  { icon: Heart, title: 'Ibu Hamil', desc: 'Pelayanan Antenatal Care (ANC) berkualitas untuk ibu hamil', color: 'from-rose-500 to-pink-600' },
  { icon: Activity, title: 'Ibu Bersalin', desc: 'Persalinan aman di fasilitas kesehatan yang kompeten', color: 'from-orange-500 to-amber-600' },
  { icon: Users, title: 'Bayi Baru Lahir', desc: 'Pemantauan tumbuh kembang bayi sejak hari pertama', color: 'from-yellow-500 to-lime-600' },
  { icon: Shield, title: 'Balita', desc: 'Posyandu aktif: penimbangan, imunisasi, dan vitamin', color: 'from-emerald-500 to-teal-600' },
  { icon: Heart, title: 'Usia Produktif', desc: 'Deteksi dini penyakit tidak menular pada usia 15–59', color: 'from-blue-500 to-cyan-600' },
  { icon: Activity, title: 'Usia Lanjut', desc: 'Pelayanan kesehatan dan sosial untuk lansia', color: 'from-violet-500 to-purple-600' },
];

const stats = [
  { value: '847', label: 'Warga Terdaftar' },
  { value: '6', label: 'Layanan SPM' },
  { value: '98%', label: 'Cakupan Imunisasi' },
  { value: '12', label: 'Kader Aktif' },
];

const analyticsData = [
  { name: 'Jan', anc: 45, imunisasi: 80, gizi: 65 },
  { name: 'Feb', anc: 52, imunisasi: 85, gizi: 70 },
  { name: 'Mar', anc: 48, imunisasi: 90, gizi: 75 },
  { name: 'Apr', anc: 61, imunisasi: 95, gizi: 82 },
  { name: 'Mei', anc: 59, imunisasi: 98, gizi: 88 },
  { name: 'Jun', anc: 65, imunisasi: 102, gizi: 95 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-100/60 via-blue-50/30 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
              +
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Posyandu Tubanan</span>
              <span className="hidden sm:block text-xs text-slate-400 leading-none">Desa Tubanan, Kec. Keling</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#tentang" className="hover:text-primary transition-colors">Tentang</a>
            <a href="#layanan" className="hover:text-primary transition-colors">Layanan SPM</a>
            <a href="#statistik" className="hover:text-primary transition-colors">Statistik</a>
            <a href="#kontak" className="hover:text-primary transition-colors">Kontak</a>
          </nav>

          <Link to="/login">
            <Button className="rounded-full shadow-lg shadow-blue-600/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 text-sm">
              Portal Digital
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────── */}
      <main>
        <section className="container mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/60 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Platform GovTech Inovasi Desa 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.1]"
          >
            Layanan Kesehatan Digital{' '}
            <br className="hidden md:block" />
            untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Masa Depan Desa
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed"
          >
            Platform terintegrasi Posyandu Desa Tubanan — memastikan 6 Standar Pelayanan Minimal tercapai
            dengan data <em>real-time</em>, akurat, dan transparan untuk semua warga.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto rounded-full shadow-xl shadow-blue-600/25 px-8 gap-2 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
                Akses Portal Digital
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#layanan">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 bg-white/60 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700">
                Lihat Layanan SPM
              </Button>
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Dashboard mockup - Modern Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-20 w-full max-w-5xl mx-auto relative px-4"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 pointer-events-none" />
            
            {/* The main dashboard frame */}
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-blue-900/40 p-1 md:p-2 ring-1 ring-white/10 overflow-hidden">
              {/* Window controls */}
              <div className="flex items-center gap-2 mb-2 px-3 pt-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              
              <div className="w-full rounded-xl bg-slate-950/50 overflow-hidden border border-slate-800 p-4 sm:p-6 lg:p-8 flex flex-col relative">
                {/* Glow effect behind chart */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
                
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Live Analytics Posyandu
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Pemantauan 6 Standar Pelayanan Minimal secara Real-time</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-slate-300 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> Imunisasi</div>
                    <div className="flex items-center gap-1.5 text-slate-300 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> Gizi</div>
                    <div className="flex items-center gap-1.5 text-slate-300 px-2 py-1 rounded-md bg-pink-500/10 border border-pink-500/20"><div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" /> ANC</div>
                  </div>
                </div>
                
                <div className="w-full h-[300px] sm:h-[400px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAnc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorImunisasi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGizi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', fontSize: '13px', color: '#f8fafc' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="imunisasi" name="Imunisasi Balita" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorImunisasi)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', style: { filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' } }} />
                      <Area type="monotone" dataKey="gizi" name="Perbaikan Gizi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGizi)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' } }} />
                      <Area type="monotone" dataKey="anc" name="Pemeriksaan ANC" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorAnc)" activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899', style: { filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.8))' } }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Floating Metric Card 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="hidden lg:flex absolute top-24 -left-12 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.3)] items-center gap-4 z-20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Total Kunjungan</p>
                <p className="text-white text-2xl font-extrabold">2,450</p>
              </div>
            </motion.div>

            {/* Floating Metric Card 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="hidden lg:flex absolute bottom-32 -right-8 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.3)] items-center gap-4 z-20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Status Kesehatan</p>
                <p className="text-white text-2xl font-extrabold">Sangat Baik</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Quick Access Portals ─── */}
        <section className="bg-slate-50 py-12 border-t border-slate-200/60 relative z-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-slate-900">Akses Portal Cepat</h2>
              <p className="text-slate-500 mt-2 text-sm">Pilih portal sesuai dengan peran Anda di Posyandu Desa Tubanan</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <a href="http://localhost:5177" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Portal Masyarakat</h3>
                <p className="text-xs text-slate-500">Pendaftaran antrian, jadwal & KMS</p>
              </a>
              <a href="http://localhost:5179" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-300 transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Portal Kader</h3>
                <p className="text-xs text-slate-500">Meja pendaftaran & pengukuran</p>
              </a>
              <a href="http://localhost:5178" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Portal Bidan</h3>
                <p className="text-xs text-slate-500">Pemeriksaan medis & rujukan</p>
              </a>
              <a href="http://localhost:5181" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all group flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Admin Panel</h3>
                <p className="text-xs text-slate-500">Manajemen jadwal & data</p>
              </a>
            </div>
          </div>
        </section>

        {/* ─── 6 SPM Services ─── */}
        <section id="layanan" className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                6 SPM Kesehatan
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Layanan Kesehatan Lengkap
              </h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">
                Kami memastikan seluruh 6 Standar Pelayanan Minimal bidang kesehatan terlaksana dengan baik melalui platform digital ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {spmServices.map(({ icon: Icon, title, desc, color }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07 }}
                  className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">SPM {idx + 1}</p>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  Mulai Gunakan Platform Digital
                </h2>
                <p className="text-blue-100 text-base max-w-lg mx-auto mb-8 leading-relaxed">
                  Daftarkan diri Anda dan nikmati layanan posyandu digital yang mudah, cepat, dan transparan.
                </p>
                <Link to="/login">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 rounded-full px-10 font-bold shadow-xl shadow-blue-900/30">
                    Masuk ke Portal Digital
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer id="kontak" className="bg-slate-900 text-slate-400 py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">+</div>
                  <span className="text-white font-bold">Posyandu Tubanan</span>
                </div>
                <p className="text-sm leading-relaxed">Platform digital pelayanan Posyandu Desa Tubanan berbasis 6 Standar Pelayanan Minimal (SPM).</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Informasi</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="#layanan" className="hover:text-white transition-colors">Layanan 6 SPM</a></li>
                  <li><a href="/login" className="hover:text-white transition-colors">Portal Digital</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Kontak</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Desa Tubanan, Kec. Keling, Jepara</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> (0291) 123-456</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-6 text-center text-xs">
              <p>© 2026 Pemerintah Desa Tubanan · Seluruh hak dilindungi</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

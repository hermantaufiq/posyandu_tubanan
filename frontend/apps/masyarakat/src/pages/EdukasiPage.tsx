import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, ExternalLink, Apple, HeartPulse, Activity } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: 'Panduan Praktis MPASI untuk Bayi 6-9 Bulan',
    category: 'Nutrisi Anak',
    readTime: '5 min',
    image: 'bg-orange-500',
    icon: Apple,
    summary: 'Ketahui tekstur, porsi, dan frekuensi makan yang tepat saat anak mulai MPASI pertama kalinya.',
    featured: true,
  },
  {
    id: 2,
    title: 'Mengenal Ciri-Ciri Stunting pada Anak Sejak Dini',
    category: 'Deteksi Dini',
    readTime: '8 min',
    image: 'bg-emerald-500',
    icon: Activity,
    summary: 'Stunting bukan sekadar pendek. Kenali tanda-tandanya agar tidak terlambat diintervensi.',
    featured: false,
  },
  {
    id: 3,
    title: 'Pentingnya Vitamin A Kapsul Biru & Merah',
    category: 'Imunisasi & Vitamin',
    readTime: '3 min',
    image: 'bg-blue-500',
    icon: HeartPulse,
    summary: 'Bulan Februari dan Agustus adalah bulan Vitamin A. Jangan sampai terlewat jadwalnya di Posyandu.',
    featured: false,
  }
];

export default function EdukasiPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Edukasi & Informasi</h1>
        <p className="text-slate-500 text-sm mt-1">Panduan resmi seputar gizi, pola asuh, dan kesehatan balita dari Kemenkes RI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Article */}
        <div className="lg:col-span-2">
          {articles.filter(a => a.featured).map((article) => {
            const Icon = article.icon;
            return (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative h-[360px] rounded-3xl overflow-hidden shadow-md cursor-pointer"
              >
                <div className={`absolute inset-0 ${article.image} opacity-90 transition-transform duration-500 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" /> {article.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-slate-200 text-xs font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-slate-300 text-sm line-clamp-2 max-w-xl">
                    {article.summary}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Video Edukasi Pendek */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col relative overflow-hidden shadow-md"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl -mr-10 -mt-10" />
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-red-500" />
            Video Pilihan
          </h3>
          <div className="flex-1 bg-slate-800 rounded-xl mb-4 relative group cursor-pointer border border-slate-700/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <p className="font-medium text-sm leading-snug">Cara Mengukur Lingkar Kepala Bayi dengan Benar</p>
          <p className="text-slate-400 text-xs mt-1">Kemenkes RI • 2 min</p>
        </motion.div>
      </div>

      {/* Other Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {articles.filter(a => !a.featured).map((article, idx) => {
          const Icon = article.icon;
          return (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 flex gap-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-24 h-24 rounded-xl ${article.image} opacity-90 flex items-center justify-center flex-shrink-0 group-hover:opacity-100 transition-opacity`}>
                <Icon className="w-8 h-8 text-white/50" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">{article.category}</span>
                <h3 className="font-bold text-slate-800 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {article.readTime}</span>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}

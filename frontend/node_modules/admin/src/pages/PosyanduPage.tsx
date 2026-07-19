import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, MapPin, Loader2, Activity, Users, CalendarDays,
  ChevronRight, ArrowLeft, Clock, Stethoscope, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

interface Posyandu {
  id: number;
  name: string;
  location: string;
  jadwals_count?: number;
  pemeriksaans_count?: number;
}

interface PosyanduDetail extends Posyandu {
  jadwals: {
    id: number;
    tanggal: string;
    kegiatan: string;
    keterangan: string;
    pemeriksaans_count: number;
  }[];
}

export default function PosyanduPage() {
  const [posyandus, setPosyandus] = useState<Posyandu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', location: '' });

  // Detail View State
  const [selectedPos, setSelectedPos] = useState<PosyanduDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/posyandu');
      setPosyandus(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/posyandu/${id}`);
      setSelectedPos(res.data.data);
    } catch (err) {
      alert("Gagal memuat detail posyandu");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/admin/posyandu/${form.id}`, form);
      } else {
        await api.post('/admin/posyandu', form);
      }
      setShowFormModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin menghapus posyandu ini? Semua jadwal yang terhubung akan terhapus.')) return;
    try {
      await api.delete(`/admin/posyandu/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus posyandu');
    }
  };

  if (selectedPos) {
    // COMMAND CENTER DETAIL VIEW
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedPos(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Command Center
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Activity className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium mb-4 inline-block">
              Detail Posyandu
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{selectedPos.name}</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {selectedPos.location}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-8">
          <CalendarDays className="w-5 h-5 text-indigo-400" /> Riwayat Kegiatan ({selectedPos.jadwals.length})
        </h3>

        {selectedPos.jadwals.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-400 font-medium">Belum ada riwayat kegiatan</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {selectedPos.jadwals.map(jadwal => (
              <div key={jadwal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{jadwal.kegiatan}</h4>
                        <p className="text-slate-400 text-sm">{jadwal.tanggal}</p>
                      </div>
                    </div>
                    {jadwal.keterangan && (
                      <p className="text-slate-500 text-sm pl-13">{jadwal.keterangan}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Pemeriksaan Selesai</p>
                      <p className="text-white font-bold">{jadwal.pemeriksaans_count} Warga</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // COMMAND CENTER DASHBOARD VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" /> Command Center Posyandu
          </h2>
          <p className="text-slate-400 text-sm mt-1">Pantau statistik dan riwayat kegiatan dari seluruh pos di Desa Tubanan.</p>
        </div>
        <button
          onClick={() => { setForm({ id: '', name: '', location: '' }); setShowFormModal(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Tambah Pos
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posyandus.map(pos => (
            <motion.div 
              key={pos.id}
              whileHover={{ y: -4 }}
              onClick={() => openDetail(pos.id)}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-indigo-500/20">
                  <MapPin className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ id: pos.id.toString(), name: pos.name, location: pos.location });
                      setShowFormModal(true);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(pos.id, e)}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{pos.name}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-6">
                {pos.location}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-500 font-medium mb-1">Total Jadwal</p>
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-400" /> {pos.jadwals_count || 0}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-500 font-medium mb-1">Total Diperiksa</p>
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> {pos.pemeriksaans_count || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-indigo-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Lihat Riwayat Detail <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loadingDetail && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-2xl">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-white font-medium">Memuat riwayat kegiatan...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {form.id ? 'Edit Posyandu' : 'Tambah Posyandu Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Nama Posyandu</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Contoh: Posyandu Mekar Sari"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Lokasi (RT/RW/Dusun)</label>
                <input
                  required
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Contoh: Balai Desa Tubanan, RT 01/02"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

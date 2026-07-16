import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import api from '../lib/api';

export default function PosyanduPage() {
  const [posyandus, setPosyandus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', location: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/admin/posyandu/${form.id}`, form);
      } else {
        await api.post('/admin/posyandu', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus posyandu ini? Semua jadwal yang terhubung akan terhapus.')) return;
    try {
      await api.delete(`/admin/posyandu/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus posyandu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Manajemen Posyandu</h2>
          <p className="text-sm text-slate-400">Kelola titik lokasi posyandu di desa Tubanan</p>
        </div>
        <button
          onClick={() => { setForm({ id: '', name: '', location: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors w-fit"
        >
          <Plus className="w-4 h-4" /> Tambah Posyandu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Memuat...</div>
        ) : posyandus.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">Belum ada titik posyandu terdaftar.</div>
        ) : posyandus.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 group flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setForm(p); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-200 mb-1">{p.name}</h3>
              <p className="text-sm text-slate-400">{p.location}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Total Jadwal</span>
              <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{p.jadwals_count} Kegiatan</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">{form.id ? 'Edit Posyandu' : 'Tambah Posyandu'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Nama Posyandu</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Contoh: Posyandu Anggrek"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Alamat Lokasi</label>
                <textarea required rows={3} value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="Contoh: Balai Desa Tubanan Lor RT 01 RW 02"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

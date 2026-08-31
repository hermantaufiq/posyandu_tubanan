import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Filter, Search } from 'lucide-react';
import api from '../lib/api';

export default function MasterKegiatanPage() {
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [posyandus, setPosyandus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: '', posyandu_id: '', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '12:00', kegiatan: '', kapasitas: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jadwalRes, posRes] = await Promise.all([
        api.get('/admin/jadwal'),
        api.get('/admin/posyandus')
      ]);
      setJadwals(jadwalRes.data.data);
      setPosyandus(posRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/admin/jadwal/${form.id}`, form);
      } else {
        await api.post('/admin/jadwal', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (j: any) => {
    setForm({
      id: j.id,
      posyandu_id: j.posyandu.id,
      tanggal: j.tanggal,
      waktu_mulai: j.waktu_mulai.substring(0,5),
      waktu_selesai: j.waktu_selesai.substring(0,5),
      kegiatan: j.kegiatan,
      kapasitas: j.kapasitas || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;
    try {
      await api.delete(`/admin/jadwal/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus jadwal');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-800 dark:text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Master Kegiatan</span>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-slate-300">Daftar</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Master Kegiatan</h2>
        </div>
        <button
          onClick={() => { setForm({ id: '', posyandu_id: '', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '12:00', kegiatan: '', kapasitas: '' }); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Buat
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari" className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-auto" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold bg-blue-100 text-blue-600 px-1.5 rounded-full">0</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm w-10"><input type="checkbox" className="rounded text-blue-600" /></th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Tanggal</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Kegiatan</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden md:table-cell">Deskripsi</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">Memuat data...</td></tr>
              ) : jadwals.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">Belum ada kegiatan terdaftar.</td></tr>
              ) : jadwals.map(j => (
                <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded text-blue-600" /></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(j.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{j.kegiatan}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-md truncate">
                    Pelayanan {j.kegiatan} di {j.posyandu.name} Bulan {new Date(j.tanggal).toLocaleDateString('id-ID', { month: 'long' })} Desa Tubanan
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors font-medium">
                        <Eye className="w-4 h-4" /> Lihat
                      </button>
                      <button onClick={() => handleEdit(j)} className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 transition-colors font-medium">
                        <Edit2 className="w-4 h-4" /> Ubah
                      </button>
                      <button onClick={() => handleDelete(j.id)} className="flex items-center gap-1.5 text-rose-500 hover:text-rose-700 transition-colors font-medium">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
          <span>Menampilkan 1 sampai {jadwals.length} dari {jadwals.length} hasil</span>
          <div className="flex items-center gap-2">
            <span>per halaman</span>
            <select className="border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-200">{form.id ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Posyandu</label>
                <select required value={form.posyandu_id} onChange={e => setForm({...form, posyandu_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500">
                  <option value="">-- Pilih Posyandu --</option>
                  {posyandus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Nama Kegiatan</label>
                <input required type="text" value={form.kegiatan} onChange={e => setForm({...form, kegiatan: e.target.value})}
                  placeholder="Contoh: Posyandu ILP Mekar Sari"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Tanggal</label>
                  <input required type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Kapasitas (opsional)</label>
                  <input type="number" value={form.kapasitas} onChange={e => setForm({...form, kapasitas: e.target.value})}
                    placeholder="Contoh: 50"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Waktu Mulai</label>
                  <input required type="time" value={form.waktu_mulai} onChange={e => setForm({...form, waktu_mulai: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Waktu Selesai</label>
                  <input required type="time" value={form.waktu_selesai} onChange={e => setForm({...form, waktu_selesai: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Simpan Kegiatan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

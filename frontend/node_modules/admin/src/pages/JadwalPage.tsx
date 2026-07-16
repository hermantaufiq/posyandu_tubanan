import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
import api from '../lib/api';

export default function JadwalPage() {
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
        api.get('/admin/posyandu')
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Manajemen Jadwal Posyandu</h2>
          <p className="text-sm text-slate-400">Atur jadwal kegiatan posyandu di desa Tubanan</p>
        </div>
        <button
          onClick={() => { setForm({ id: '', posyandu_id: '', tanggal: '', waktu_mulai: '08:00', waktu_selesai: '12:00', kegiatan: '', kapasitas: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors w-fit"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Tanggal & Waktu</th>
                <th className="px-5 py-4">Kegiatan</th>
                <th className="px-5 py-4">Posyandu</th>
                <th className="px-5 py-4 text-center">Pendaftar</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Memuat...</td></tr>
              ) : jadwals.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">Belum ada jadwal.</td></tr>
              ) : jadwals.map(j => (
                <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-200 font-medium mb-1">
                      <Calendar className="w-4 h-4 text-blue-500" /> {new Date(j.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5" /> {j.waktu_mulai.substring(0,5)} - {j.waktu_selesai.substring(0,5)} WIB
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-200">{j.kegiatan}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {j.posyandu.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20">
                      {j.antrian_count} {j.kapasitas ? `/ ${j.kapasitas}` : ''}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(j)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(j.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">{form.id ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Posyandu</label>
                <select required value={form.posyandu_id} onChange={e => setForm({...form, posyandu_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500">
                  <option value="">-- Pilih Posyandu --</option>
                  {posyandus.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Kegiatan</label>
                <input required type="text" value={form.kegiatan} onChange={e => setForm({...form, kegiatan: e.target.value})}
                  placeholder="Contoh: Penimbangan Balita & Ibu Hamil"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Tanggal</label>
                  <input required type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Kapasitas (opsional)</label>
                  <input type="number" value={form.kapasitas} onChange={e => setForm({...form, kapasitas: e.target.value})}
                    placeholder="Contoh: 50"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Waktu Mulai</label>
                  <input required type="time" value={form.waktu_mulai} onChange={e => setForm({...form, waktu_mulai: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Waktu Selesai</label>
                  <input required type="time" value={form.waktu_selesai} onChange={e => setForm({...form, waktu_selesai: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
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

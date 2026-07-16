import { useState, useEffect } from 'react';
import { HeartHandshake, QrCode, ClipboardEdit, LogOut, CheckCircle2, UserPlus, Search, AlertCircle, Activity } from 'lucide-react';
import api from '../lib/api';

export default function DashboardKader() {
  const [activeTab, setActiveTab] = useState<'meja1' | 'meja2' | 'meja3'>('meja1');
  const [user] = useState(() => JSON.parse(localStorage.getItem('kader_auth_user') || '{}'));
  const [antrians, setAntrians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Meja 1 Walk-in form state
  const [walkinForm, setWalkinForm] = useState({ nik: '', name: '', jenis_layanan: 'Balita' });

  const jadwalId = 1;

  useEffect(() => {
    fetchAntrian();
    const interval = setInterval(fetchAntrian, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAntrian = async () => {
    try {
      const res = await api.get(`/kader/antrian?jadwal_id=${jadwalId}`);
      setAntrians(res.data.data ?? []);
    } catch {}
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('kader_auth_token');
    localStorage.removeItem('kader_auth_user');
    window.location.href = '/login';
  };

  const handleWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/kader/warga/walkin', { ...walkinForm, jadwal_id: jadwalId });
      setWalkinForm({ nik: '', name: '', jenis_layanan: 'Balita' });
      fetchAntrian();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mendaftarkan warga.');
    } finally {
      setLoading(false);
    }
  };

  const tandaiHadir = async (id: number) => {
    try {
      await api.post('/kader/warga/hadir', { antrian_id: id });
      fetchAntrian();
    } catch (err) {
      alert('Gagal menandai hadir');
    }
  };

  // Filter antrians by status for each Meja
  const antrianMeja1 = antrians.filter(a => a.status === 'menunggu');
  const antrianMeja2 = antrians.filter(a => a.status === 'hadir');
  const antrianSelesai = antrians.filter(a => a.status === 'selesai' || a.status === 'tunggu_bidan');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-800 leading-tight">Portal Kader Posyandu</h1>
              <p className="text-xs text-slate-500">Pendaftaran & Pengukuran Warga</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="font-bold text-sm text-slate-800">{user.name || 'Kader'}</span>
              <span className="text-xs text-emerald-600 font-medium">Petugas Aktif</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex overflow-x-auto w-full md:w-auto">
          <button onClick={() => setActiveTab('meja1')}
            className={`flex whitespace-nowrap items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'meja1' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <QrCode className="w-4 h-4" /> Meja 1: Pendaftaran ({antrianMeja1.length})
          </button>
          <button onClick={() => setActiveTab('meja2')}
            className={`flex whitespace-nowrap items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'meja2' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <ClipboardEdit className="w-4 h-4" /> Meja 2: Pengukuran ({antrianMeja2.length})
          </button>
          <button onClick={() => setActiveTab('meja3')}
            className={`flex whitespace-nowrap items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'meja3' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <CheckCircle2 className="w-4 h-4" /> Meja 3: Pencatatan ({antrianSelesai.length})
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[400px]">
          {activeTab === 'meja1' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Walk-in Form */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">Daftar Warga Baru (Walk-in)</h2>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                <form onSubmit={handleWalkin} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" required value={walkinForm.name} onChange={e => setWalkinForm({...walkinForm, name: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                    <input type="text" required maxLength={16} minLength={16} value={walkinForm.nik} onChange={e => setWalkinForm({...walkinForm, nik: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Layanan</label>
                    <select value={walkinForm.jenis_layanan} onChange={e => setWalkinForm({...walkinForm, jenis_layanan: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500">
                      <option value="Balita">Balita</option>
                      <option value="Ibu Hamil">Ibu Hamil</option>
                      <option value="Ibu Nifas">Ibu Nifas</option>
                      <option value="Lansia">Lansia</option>
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                    {loading ? 'Menyimpan...' : 'Daftarkan & Masukkan Antrian'}
                  </button>
                </form>
              </div>

              {/* Waiting List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-800">Menunggu Kehadiran</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {antrianMeja1.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Tidak ada warga yang menunggu.</p>
                  ) : (
                    antrianMeja1.map(a => (
                      <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{a.user?.name}</p>
                          <p className="text-xs text-slate-500">Antrian: {a.nomor_antri} • {a.jenis_layanan}</p>
                        </div>
                        <button onClick={() => tandaiHadir(a.id)} className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-bold rounded-lg transition-colors">
                          Tandai Hadir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meja2' && (
             <div>
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardEdit className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">Antrian Pengukuran (Meja 2)</h2>
                </div>
                <div className="space-y-4">
                  {antrianMeja2.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Belum ada warga di Meja 2.</p>
                  ) : (
                    antrianMeja2.map(a => (
                      <Meja2Card key={a.id} antrian={a} onSaved={fetchAntrian} />
                    ))
                  )}
                </div>
             </div>
          )}
          {activeTab === 'meja3' && (
             <div>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">Pencatatan & Monitoring (Meja 3 & Selesai)</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                     <p className="text-emerald-700 font-bold text-2xl">{antrians.length}</p>
                     <p className="text-emerald-600 text-xs font-semibold uppercase">Total Antrian</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                     <p className="text-amber-700 font-bold text-2xl">{antrianMeja2.length}</p>
                     <p className="text-amber-600 text-xs font-semibold uppercase">Di Meja 2</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                     <p className="text-blue-700 font-bold text-2xl">{antrians.filter(a => a.status === 'tunggu_bidan').length}</p>
                     <p className="text-blue-600 text-xs font-semibold uppercase">Di Bidan</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                     <p className="text-slate-700 font-bold text-2xl">{antrians.filter(a => a.status === 'selesai').length}</p>
                     <p className="text-slate-500 text-xs font-semibold uppercase">Selesai</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {antrianSelesai.map(a => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{a.user?.name}</p>
                        <p className="text-xs text-slate-500">{a.jenis_layanan} • BB: {a.pemeriksaan?.berat_badan}kg TB: {a.pemeriksaan?.tinggi_badan}cm</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.status === 'selesai' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                        {a.status === 'selesai' ? 'Selesai' : 'Di Bidan'}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Card untuk form Pengukuran
function Meja2Card({ antrian, onSaved }: { antrian: any, onSaved: () => void }) {
  const [form, setForm] = useState({ berat_badan: '', tinggi_badan: '', lingkar_kepala: '' });
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/kader/warga/pengukuran', {
        antrian_id: antrian.id,
        berat_badan: parseFloat(form.berat_badan),
        tinggi_badan: parseFloat(form.tinggi_badan),
        lingkar_kepala: form.lingkar_kepala ? parseFloat(form.lingkar_kepala) : null,
      });
      onSaved();
    } catch {
      alert('Gagal menyimpan pengukuran');
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-800">{antrian.user?.name}</p>
          <p className="text-xs text-slate-500">Antrian: {antrian.nomor_antri} • {antrian.jenis_layanan}</p>
        </div>
      </div>
      <form onSubmit={save} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">BB (kg)</label>
          <input type="number" step="0.1" required value={form.berat_badan} onChange={e => setForm({...form, berat_badan: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">TB (cm)</label>
          <input type="number" step="0.1" required value={form.tinggi_badan} onChange={e => setForm({...form, tinggi_badan: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
        </div>
        {antrian.jenis_layanan === 'Balita' && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">L. Kepala (cm)</label>
            <input type="number" step="0.1" value={form.lingkar_kepala} onChange={e => setForm({...form, lingkar_kepala: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
          </div>
        )}
        <div className="flex items-end md:col-start-4">
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors">
            {loading ? '...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}

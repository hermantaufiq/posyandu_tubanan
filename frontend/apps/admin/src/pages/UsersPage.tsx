import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import api from '../lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users${filter ? `?role=${filter}` : ''}`);
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleToggle = async (id: number) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert('Gagal merubah status user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    (u.nik && u.nik.includes(search)) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-400">Kelola akun warga, nakes, dan kader</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Cari nama, email, atau NIK..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-blue-500 w-full sm:w-48">
          <option value="">Semua Peran</option>
          <option value="warga">Warga</option>
          <option value="kader">Kader</option>
          <option value="nakes">Nakes (Bidan)</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Pengguna</th>
                <th className="px-5 py-4">Kontak / NIK</th>
                <th className="px-5 py-4">Peran</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Memuat...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">Tidak ada pengguna ditemukan.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-500">Terdaftar: {u.created_at}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-300">{u.email}</p>
                    <p className="text-xs text-slate-500">NIK: {u.nik || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles?.map((r: string) => (
                        <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          r === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          r === 'nakes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          r === 'kader' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {u.is_active ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleToggle(u.id)}
                      title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                      className={`p-2 rounded-lg transition-colors ${
                        u.is_active ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

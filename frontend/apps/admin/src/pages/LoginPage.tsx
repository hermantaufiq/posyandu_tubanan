import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      if (user.role !== 'admin') {
        throw new Error('Akses ditolak. Anda bukan admin.');
      }
      localStorage.setItem('admin_auth_token', token);
      localStorage.setItem('admin_auth_user', JSON.stringify(user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SIPO Logo" className="w-16 h-16 rounded-full bg-white mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SIPO-Terpadu Tubanan</h1>
          <p className="text-slate-400 mt-1">Sistem Informasi Posyandu Desa Tubanan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email / NIK</label>
              <input
                type="text"
                required
                value={form.login}
                onChange={e => setForm({ ...form, login: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Contoh: admin@posyandu.id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Masuk...' : 'Masuk ke SIPO-Terpadu Tubanan'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 text-sm text-slate-500">
          Hanya untuk pengurus dan kepala desa yang berwenang.
        </div>
      </div>
    </div>
  );
}

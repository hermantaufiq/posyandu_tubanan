import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowRight, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';
import api from '../lib/api';

export default function LoginPage() {
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { login, password });
      const { user, token } = res.data.data;
      if (!user.roles?.includes('kader')) throw new Error('Akses ditolak. Anda bukan Kader Posyandu.');
      localStorage.setItem('kader_auth_token', token);
      localStorage.setItem('kader_auth_user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login gagal.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Portal Kader Posyandu</h1>
            <p className="text-emerald-100 text-sm leading-relaxed">Meja 1, 2 & 3 — Pendaftaran, Pengukuran & Pencatatan KMS</p>
          </div>
          <div className="relative z-10 mt-10 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="font-bold text-sm">Akses Terverifikasi</span>
            </div>
            <p className="text-xs text-emerald-100">Khusus Kader resmi yang ditunjuk oleh SK Kepala Desa Tubanan.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Selamat Datang, Kader!</h2>
            <p className="text-sm text-slate-500 mb-8">Masuk menggunakan email atau NIK Anda</p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email / NIK</label>
                <input type="text" required value={login} onChange={e => setLogin(e.target.value)}
                  placeholder="Contoh: kader@desa.id atau NIK 16 digit"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all pr-12" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 mt-2">
                {loading ? 'Memverifikasi...' : <><span>Masuk ke Portal Kader</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Belum punya akun?{' '}
                <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700">
                  Daftar dengan Kode Undangan
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, HeartPulse, ShieldCheck, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { login, password });
      const { user, token } = res.data.data;

      if (!user.roles || !user.roles.includes('nakes')) {
        throw new Error('Akses ditolak. Anda bukan Tenaga Kesehatan yang terdaftar.');
      }

      localStorage.setItem('nakes_auth_token', token);
      localStorage.setItem('nakes_auth_user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal login. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <HeartPulse className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Portal Bidan Desa</h1>
            <p className="text-blue-100 text-sm leading-relaxed">Sistem Informasi Pelayanan Kesehatan Medis Terpadu Posyandu Desa Tubanan.</p>
          </div>
          
          <div className="relative z-10 mt-12 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="font-bold text-sm">Akses Terbatas</span>
            </div>
            <p className="text-xs text-blue-100">Portal ini khusus untuk Tenaga Kesehatan resmi. Segala aktivitas dicatat oleh sistem.</p>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
              <p className="text-sm text-slate-500 mt-1">Silakan masuk dengan NIP atau Email Anda</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">NIP / Email Resmi</label>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="Contoh: bidan@posyandu.id"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {isLoading ? 'Memverifikasi...' : 'Masuk ke Portal'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
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

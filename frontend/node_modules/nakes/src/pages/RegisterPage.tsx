import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    invite_code: '',
    jabatan: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await api.post('/nakes/register', form);
      const { user, token } = res.data.data;

      localStorage.setItem('nakes_auth_token', token);
      localStorage.setItem('nakes_auth_user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs = err.response.data.errors;
        const mapped: Record<string, string> = {};
        Object.keys(errs).forEach(k => { mapped[k] = errs[k][0]; });
        setFieldErrors(mapped);
      }
      setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 outline-none transition-all text-sm ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <Stethoscope className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Daftar Sebagai Tenaga Kesehatan</h1>
          <p className="text-slate-500 text-sm mt-1">Posyandu Desa Tubanan — Sistem Pelayanan Terpadu</p>
        </div>

        {/* Notice Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-6">
          <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Diperlukan Kode Undangan</p>
            <p className="text-xs text-amber-700 mt-0.5">Pendaftaran ini hanya untuk Tenaga Kesehatan resmi. Hubungi Kepala Posyandu atau Bidan Koordinator untuk mendapatkan kode undangan.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Nama sesuai identitas resmi"
                  className={`${inputCls('name')} pl-10`} />
              </div>
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Jabatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Jabatan / Profesi</label>
              <select value={form.jabatan} onChange={e => set('jabatan', e.target.value)}
                className={inputCls('jabatan')}>
                <option value="">— Pilih jabatan —</option>
                <option value="Bidan Desa">Bidan Desa</option>
                <option value="Perawat">Perawat</option>
                <option value="Dokter Puskesmas">Dokter Puskesmas</option>
                <option value="Tenaga Gizi">Tenaga Gizi</option>
                <option value="Sanitarian">Sanitarian</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Resmi / Institusi</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="email@instansi.go.id"
                  className={`${inputCls('email')} pl-10`} />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 karakter"
                    className={`${inputCls('password')} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Konfirmasi Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)}
                    placeholder="Ulangi sandi"
                    className={`${inputCls('password_confirmation')} pl-10`} />
                </div>
              </div>
            </div>

            {/* Kode Undangan */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Kode Undangan Resmi
              </label>
              <div className="relative">
                <input type={showCode ? 'text' : 'password'} required value={form.invite_code} onChange={e => set('invite_code', e.target.value.toUpperCase())}
                  placeholder="Masukkan kode dari Kepala Posyandu"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all text-sm font-mono tracking-widest ${
                    fieldErrors.invite_code
                      ? 'bg-red-50 border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'bg-amber-50 border-amber-200 focus:bg-white focus:border-amber-500 focus:ring-amber-100'
                  } pr-12`} />
                <button type="button" onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.invite_code && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.invite_code}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memverifikasi...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Daftar Sebagai Tenaga Kesehatan <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Data Anda aman dan terenkripsi. Portal ini hanya untuk personel Posyandu resmi.</span>
        </div>
      </div>
    </div>
  );
}

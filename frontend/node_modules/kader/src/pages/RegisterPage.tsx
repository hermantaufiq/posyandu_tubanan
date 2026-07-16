import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    invite_code: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setLoading(true);
    try {
      const res = await api.post('/kader/register', form);
      const { user, token } = res.data.data;
      localStorage.setItem('kader_auth_token', token);
      localStorage.setItem('kader_auth_user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs = err.response.data.errors;
        const mapped: Record<string, string> = {};
        Object.keys(errs).forEach(k => { mapped[k] = errs[k][0]; });
        setFieldErrors(mapped);
      }
      setError(err.response?.data?.message || 'Pendaftaran gagal.');
    } finally { setLoading(false); }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 outline-none text-sm transition-all ${
      fieldErrors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
            <HeartHandshake className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Daftar Kader Posyandu</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  className={`${inputCls('name')} pl-10`} placeholder="Sesuai SK / KTP" />
              </div>
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className={`${inputCls('email')} pl-10`} placeholder="email@contoh.com" />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)}
                    className={`${inputCls('password')} pl-10 pr-10`} placeholder="Min. 8 karakter" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Konfirmasi Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)}
                    className={`${inputCls('password_confirmation')} pl-10`} placeholder="Ulangi sandi" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Kode Undangan Kader
              </label>
              <div className="relative">
                <input type={showCode ? 'text' : 'password'} required value={form.invite_code} onChange={e => set('invite_code', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none text-sm font-mono tracking-widest pr-10 ${
                    fieldErrors.invite_code ? 'bg-red-50 border-red-300 focus:border-red-500 focus:ring-red-100' : 'bg-emerald-50 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-100 focus:bg-white'
                  }`} placeholder="Masukkan kode dari Desa" />
                <button type="button" onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.invite_code && <p className="text-red-500 text-xs mt-1">{fieldErrors.invite_code}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                {loading ? 'Memverifikasi...' : <><CheckCircle2 className="w-4 h-4" /> Daftar Kader <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun? <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

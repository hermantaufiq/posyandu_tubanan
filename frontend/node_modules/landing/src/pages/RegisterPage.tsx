import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, User, CreditCard, Phone, Calendar, MapPin, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const registerSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nik: z.string()
    .length(16, 'NIK harus tepat 16 digit')
    .regex(/^[0-9]+$/, 'NIK hanya boleh berisi angka'),
  phone: z.string()
    .min(10, 'Nomor HP minimal 10 digit')
    .max(15, 'Nomor HP maksimal 15 digit')
    .regex(/^[0-9+]+$/, 'Format nomor HP tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  date_of_birth: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['male', 'female'], { message: 'Jenis kelamin wajib dipilih' }),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password harus mengandung huruf dan angka'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Konfirmasi password tidak sesuai',
  path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const steps = [
  { id: 1, title: 'Data Diri', icon: User },
  { id: 2, title: 'Identitas', icon: CreditCard },
  { id: 3, title: 'Keamanan', icon: Lock },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    const fieldsPerStep: Record<number, (keyof RegisterFormData)[]> = {
      1: ['name', 'email', 'date_of_birth', 'gender', 'address'],
      2: ['nik', 'phone'],
    };
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setServerErrors({});
    try {
      const res = await authService.register(data);
      authService.saveSession(res.data.token, res.data.user);
      navigate('/register/success');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (e?.response?.data?.errors) {
        const errs: Record<string, string> = {};
        Object.entries(e.response.data.errors).forEach(([k, v]) => { errs[k] = v[0]; });
        setServerErrors(errs);
        
        // Find which step has the error to navigate correctly
        if (errs.password || errs.password_confirmation) setStep(3);
        else if (errs.nik || errs.phone) setStep(2);
        else setStep(1);
        
        // Show a global message so the user knows an error occurred
        setServerError(e.response.data.message || 'Mohon periksa kembali isian Anda.');
      } else {
        setServerError(e?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
      }
    }
  };

  const InputField = ({ id, label, icon: Icon, error, serverErr, children }: {
    id: string; label: string; icon: React.ElementType;
    error?: string; serverErr?: string; children: React.ReactNode
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
        <Icon className="w-3.5 h-3.5 text-slate-400" />{label}
      </label>
      {children}
      {(error || serverErr) && <p className="text-red-400 text-xs">{error || serverErr}</p>}
    </div>
  );

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-xl">Daftar Akun Baru</h1>
            <p className="text-slate-400 text-xs mt-0.5">Khusus untuk Masyarakat Desa Tubanan</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map(({ id, title, icon: StepIcon }, idx) => (
            <div key={id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === id
                  ? 'bg-blue-600 text-white'
                  : step > id
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-500'
              }`}>
                {step > id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                {title}
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-px ${step > id ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {serverError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5">
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ── Step 1: Data Diri ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <InputField id="name" label="Nama Lengkap" icon={User} error={errors.name?.message} serverErr={serverErrors.name}>
                  <input id="name" type="text" placeholder="Nama sesuai KTP" {...register('name')} className={inputClass} />
                </InputField>

                <InputField id="email" label="Email (Opsional)" icon={User} error={errors.email?.message} serverErr={serverErrors.email}>
                  <input id="email" type="email" placeholder="email@contoh.com" {...register('email')} className={inputClass} />
                </InputField>

                <div className="grid grid-cols-2 gap-4">
                  <InputField id="date_of_birth" label="Tanggal Lahir" icon={Calendar} error={errors.date_of_birth?.message} serverErr={serverErrors.date_of_birth}>
                    <input id="date_of_birth" type="date" max={new Date().toISOString().split('T')[0]} {...register('date_of_birth')} className={inputClass} />
                  </InputField>
                  <InputField id="gender" label="Jenis Kelamin" icon={User} error={errors.gender?.message} serverErr={serverErrors.gender}>
                    <select id="gender" {...register('gender')} className={inputClass + " appearance-none"}>
                      <option value="" className="bg-slate-800">Pilih...</option>
                      <option value="male" className="bg-slate-800">Laki-laki</option>
                      <option value="female" className="bg-slate-800">Perempuan</option>
                    </select>
                  </InputField>
                </div>

                <InputField id="address" label="Alamat Lengkap" icon={MapPin} error={errors.address?.message} serverErr={serverErrors.address}>
                  <textarea id="address" rows={3} placeholder="RT/RW, Dusun, Desa Tubanan" {...register('address')} className={inputClass + " resize-none"} />
                </InputField>

                <button type="button" onClick={nextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all">
                  Lanjut →
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Identitas ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs">
                  ℹ️ NIK adalah Nomor Induk Kependudukan 16 digit yang tercantum di KTP Anda.
                </div>

                <InputField id="nik" label="NIK (16 digit)" icon={CreditCard} error={errors.nik?.message} serverErr={serverErrors.nik}>
                  <input id="nik" type="text" maxLength={16} placeholder="3312XXXXXXXXXXXX" {...register('nik')} className={inputClass} />
                </InputField>

                <InputField id="phone" label="Nomor HP Aktif" icon={Phone} error={errors.phone?.message} serverErr={serverErrors.phone}>
                  <input id="phone" type="tel" placeholder="08XXXXXXXXXX" {...register('phone')} className={inputClass} />
                </InputField>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all">
                    ← Kembali
                  </button>
                  <button type="button" onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all">
                    Lanjut →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Keamanan ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <InputField id="password" label="Buat Password" icon={Lock} error={errors.password?.message} serverErr={serverErrors.password}>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 karakter (huruf + angka)" {...register('password')} className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </InputField>

                <InputField id="password_confirmation" label="Konfirmasi Password" icon={Lock} error={errors.password_confirmation?.message} serverErr={serverErrors.password_confirmation}>
                  <div className="relative">
                    <input id="password_confirmation" type={showConfirm ? 'text' : 'password'} placeholder="Ulangi password Anda" {...register('password_confirmation')} className={inputClass + " pr-12"} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </InputField>

                <p className="text-slate-500 text-xs">
                  Dengan mendaftar, Anda menyetujui bahwa data yang diisi adalah benar dan dapat diverifikasi oleh petugas Desa Tubanan.
                </p>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold py-3 rounded-xl transition-all">
                    ← Kembali
                  </button>
                  <button id="register-submit" type="submit" disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</> : <><CheckCircle2 className="w-4 h-4" /> Daftar Sekarang</>}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-5 text-center">
            <p className="text-slate-400 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Masuk</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

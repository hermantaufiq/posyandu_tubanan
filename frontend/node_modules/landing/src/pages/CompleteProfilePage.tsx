import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, CreditCard, Phone, Calendar, MapPin } from 'lucide-react';
import api from '../lib/api';
import { authService } from '../services/authService';

const completeSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^[0-9]+$/, 'NIK hanya boleh angka'),
  phone: z.string().min(10, 'Nomor HP minimal 10 digit').regex(/^[0-9+]+$/, 'Format tidak valid'),
  date_of_birth: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['male', 'female'], { message: 'Wajib dipilih' }),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
});
type CompleteFormData = z.infer<typeof completeSchema>;

const user = authService.getUser();

export default function CompleteProfilePage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
  });

  const onSubmit = async (data: CompleteFormData) => {
    setServerError(null);
    try {
      const res = await api.post('/profile/complete', data);
      const updated = res.data.data;
      const token = authService.getToken()!;
      authService.saveSession(token, { ...updated });
      window.location.href = authService.getDashboardUrl(updated.role);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message || 'Gagal menyimpan. Coba lagi.');
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            {user?.avatar && (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-blue-500/50" />
            )}
            <h1 className="text-xl font-bold text-white">Selamat datang, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-slate-400 text-sm mt-1">
              Lengkapi data identitas Anda untuk mulai menggunakan portal posyandu.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs mb-5">
            ℹ️ Data ini diperlukan untuk verifikasi kependudukan Desa Tubanan dan hanya digunakan untuk keperluan layanan kesehatan.
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> NIK (16 digit)
              </label>
              <input type="text" maxLength={16} placeholder="3312XXXXXXXXXXXX" {...register('nik')} className={inputClass} />
              {errors.nik && <p className="text-red-400 text-xs">{errors.nik.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Nomor HP Aktif
              </label>
              <input type="tel" placeholder="08XXXXXXXXXX" {...register('phone')} className={inputClass} />
              {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Lahir
                </label>
                <input type="date" max={new Date().toISOString().split('T')[0]} {...register('date_of_birth')} className={inputClass} />
                {errors.date_of_birth && <p className="text-red-400 text-xs">{errors.date_of_birth.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 text-sm font-medium block">Jenis Kelamin</label>
                <select {...register('gender')} className={inputClass + " appearance-none"}>
                  <option value="" className="bg-slate-800">Pilih...</option>
                  <option value="male" className="bg-slate-800">Laki-laki</option>
                  <option value="female" className="bg-slate-800">Perempuan</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alamat Lengkap
              </label>
              <textarea rows={3} placeholder="RT/RW, Dusun, Desa Tubanan" {...register('address')} className={inputClass + " resize-none"} />
              {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 mt-2">
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                : <><CheckCircle2 className="w-4 h-4" /> Simpan & Lanjutkan</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

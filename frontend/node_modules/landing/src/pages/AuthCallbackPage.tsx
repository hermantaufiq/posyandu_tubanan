import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

/**
 * AuthCallbackPage — handles redirect from Google OAuth
 * URL hash fragment: #token=xxx&role=yyy  OR  #token=xxx&needs_nik=true
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);

    const token = params.get('token');
    const role = params.get('role');
    const needsNik = params.get('needs_nik') === 'true';

    // Check for error param in query string
    const queryParams = new URLSearchParams(window.location.search);
    const errorParam = queryParams.get('error');

    if (errorParam === 'google_failed') {
      setError('Gagal login dengan Google. Silakan coba lagi.');
      return;
    }
    if (errorParam === 'account_inactive') {
      setError('Akun Anda dinonaktifkan. Hubungi admin.');
      return;
    }

    if (!token) {
      setError('Token tidak ditemukan. Silakan login ulang.');
      return;
    }

    // Store token temporarily (we'll fetch user data)
    localStorage.setItem('auth_token', token);

    // Fetch user profile
    authService.me().then((user) => {
      authService.saveSession(token, user);
      if (needsNik) {
        navigate('/complete-profile');
      } else {
        window.location.href = authService.getDashboardUrl(role || user.role);
      }
    }).catch(() => {
      setError('Sesi tidak valid. Silakan login ulang.');
      localStorage.removeItem('auth_token');
    });
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 font-semibold mb-4">{error}</p>
          <a href="/login" className="text-blue-400 hover:underline text-sm">Kembali ke halaman login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white font-semibold">Memverifikasi akun Google Anda...</p>
        <p className="text-slate-400 text-sm mt-1">Mohon tunggu sebentar</p>
      </motion.div>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import KmsPage from './pages/KmsPage';
import JadwalPage from './pages/JadwalPage';
import RiwayatPage from './pages/RiwayatPage';
import EdukasiPage from './pages/EdukasiPage';
import AntriPage from './pages/AntriPage';
import PengumumanPage from './pages/PengumumanPage';

// --- Cross-domain SSO: baca token dari URL sebelum routing ---
// Landing page mengirim token via ?token=xxx&user=yyy setelah login berhasil
const params = new URLSearchParams(window.location.search);
const tokenParam = params.get('token');
const userParam = params.get('user');
if (tokenParam && userParam) {
  try {
    localStorage.setItem('auth_token', tokenParam);
    localStorage.setItem('auth_user', userParam);
  } catch (_) { /* ignore */ }
  // Bersihkan URL tanpa reload
  window.history.replaceState({}, document.title, window.location.pathname);
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="antri" element={<AntriPage />} />
        <Route path="kms" element={<KmsPage />} />
        <Route path="jadwal" element={<JadwalPage />} />
        <Route path="riwayat" element={<RiwayatPage />} />
        <Route path="edukasi" element={<EdukasiPage />} />
        <Route path="pengumuman" element={<PengumumanPage />} />
      </Route>
    </Routes>
  );
}

export default App;

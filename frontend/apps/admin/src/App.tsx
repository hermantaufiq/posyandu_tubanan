import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MasterKegiatanPage from './pages/MasterKegiatanPage';
import RekapSasaranPage from './pages/RekapSasaranPage';
import UsersPage from './pages/UsersPage';
import LaporanPage from './pages/LaporanPage';
import PosyanduPage from './pages/PosyanduPage';
import PengaturanPage from './pages/PengaturanPage';
import PengumumanPage from './pages/PengumumanPage';
import AdminLayout from './layouts/AdminLayout';
import { ThemeProvider } from './components/ThemeContext';

// --- Cross-domain SSO: baca token dari URL sebelum routing ---
const _params = new URLSearchParams(window.location.search);
const _token = _params.get('token');
const _user = _params.get('user');
if (_token && _user) {
  try {
    localStorage.setItem('admin_auth_token', _token);
    localStorage.setItem('admin_auth_user', _user);
  } catch (_) { /* ignore */ }
  window.history.replaceState({}, document.title, window.location.pathname);
}


function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('admin_auth_token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

import PwaInstallBanner from './components/PwaInstallBanner';

import ProfilDesaPage from './pages/ProfilDesaPage';
import SkPosyanduPage from './pages/SkPosyanduPage';
import LaporanSpmPage from './pages/LaporanSpmPage';
import VerifikasiPage from './pages/VerifikasiPage';

export default function App() {
  return (
    <ThemeProvider>
      <PwaInstallBanner appName="SIPO Admin" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
            <Route path="rekap-sasaran" element={<RekapSasaranPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="laporan" element={<LaporanPage />} />
            <Route path="posyandu" element={<PosyanduPage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
            <Route path="pengumuman" element={<PengumumanPage />} />
            
            {/* New Routes */}
            <Route path="profil-desa" element={<ProfilDesaPage />} />
            <Route path="sk-posyandu" element={<SkPosyanduPage />} />
            <Route path="laporan-spm" element={<LaporanSpmPage />} />
            <Route path="verifikasi" element={<VerifikasiPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

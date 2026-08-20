import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardKader from './pages/DashboardKader';
import UploadFotoPage from './pages/UploadFotoPage';
import LaporanPwsPage from './pages/LaporanPwsPage';
import { ThemeProvider } from './components/ThemeContext';

import PelaksanaanPosyanduPage from './pages/PelaksanaanPosyanduPage';
import InputPemeriksaanPage from './pages/InputPemeriksaanPage';
import CetakBarcodePage from './pages/CetakBarcodePage';

// --- Cross-domain SSO: baca token dari URL sebelum routing ---
const _params = new URLSearchParams(window.location.search);
const _token = _params.get('token');
const _user = _params.get('user');
if (_token && _user) {
  try {
    localStorage.setItem('kader_auth_token', _token);
    localStorage.setItem('kader_auth_user', decodeURIComponent(_user));
  } catch (_) { /* ignore */ }
  window.history.replaceState({}, document.title, window.location.pathname);
}


function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('kader_auth_token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

import PwaInstallBanner from './components/PwaInstallBanner';

export default function App() {
  return (
    <ThemeProvider>
      <PwaInstallBanner appName="SIPO Kader" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RequireAuth><DashboardKader /></RequireAuth>} />
          <Route path="/upload-foto" element={<RequireAuth><UploadFotoPage /></RequireAuth>} />
          <Route path="/laporan-pws" element={<RequireAuth><LaporanPwsPage /></RequireAuth>} />
          <Route path="/cetak-barcode" element={<RequireAuth><CetakBarcodePage /></RequireAuth>} />
          <Route path="/pelaksanaan" element={<RequireAuth><PelaksanaanPosyanduPage /></RequireAuth>} />
          <Route path="/input-pemeriksaan/:antrian_id" element={<RequireAuth><InputPemeriksaanPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import JadwalPage from './pages/JadwalPage';
import UsersPage from './pages/UsersPage';
import LaporanPage from './pages/LaporanPage';
import PosyanduPage from './pages/PosyanduPage';
import AdminLayout from './layouts/AdminLayout';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('admin_auth_token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="jadwal" element={<JadwalPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="laporan" element={<LaporanPage />} />
          <Route path="posyandu" element={<PosyanduPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import KmsPage from './pages/KmsPage';
import JadwalPage from './pages/JadwalPage';
import RiwayatPage from './pages/RiwayatPage';
import EdukasiPage from './pages/EdukasiPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="kms" element={<KmsPage />} />
        <Route path="jadwal" element={<JadwalPage />} />
        <Route path="riwayat" element={<RiwayatPage />} />
        <Route path="edukasi" element={<EdukasiPage />} />
      </Route>
    </Routes>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

// Redirect /login dan semua route lain ke portal masyarakat yang sebenarnya
function RedirectToMasyarakat() {
  window.location.href = 'https://masyarakat-murex.vercel.app';
  return null;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RedirectToMasyarakat />} />
      <Route path="/register" element={<RedirectToMasyarakat />} />
      <Route path="/register/success" element={<RedirectToMasyarakat />} />
      <Route path="/auth/callback" element={<RedirectToMasyarakat />} />
      <Route path="/complete-profile" element={<RedirectToMasyarakat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

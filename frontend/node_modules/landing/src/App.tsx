import { Routes, Route } from 'react-router-dom';
import { Lock } from 'lucide-react';
import LandingPage from './pages/LandingPage';

function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-4">Sedang Maintenance</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          Portal Masyarakat / Warga SIPO-Terpadu sedang dalam tahap perbaikan dan penyempurnaan sistem. Silakan kembali lagi nanti.
        </p>
        <div className="inline-block px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-full">
          SIPO-Terpadu Tubanan
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Maintenance />} />
      <Route path="/register" element={<Maintenance />} />
      <Route path="/register/success" element={<Maintenance />} />
      <Route path="/auth/callback" element={<Maintenance />} />
      <Route path="/complete-profile" element={<Maintenance />} />
    </Routes>
  );
}

export default App;

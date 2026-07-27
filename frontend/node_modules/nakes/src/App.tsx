import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardNakes from './pages/DashboardNakes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('nakes_auth_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <DashboardNakes />
            </RequireAuth>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

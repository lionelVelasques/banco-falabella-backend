import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage';

// Páginas de clientes
import DashboardPage from './pages/DashboardPage';
import CuentasPage from './pages/CuentasPage';
import TransferenciasPage from './pages/TransferenciasPage';
import TarjetaCMRPage from './pages/TarjetaCMRPage';
import PrestamosPage from './pages/PrestamosPage';
import PagarPrestamoPage from './pages/PagarPrestamoPage';
import PagarServiciosPage from './pages/PagarServiciosPage';
import SolicitarCreditoPage from './pages/SolicitarCreditoPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PerfilPage from './pages/PerfilPage';

// Páginas de administrador
import AdminCreditosPage from './pages/AdminCreditosPage';
import AdminPrestamosPage from './pages/AdminPrestamosPage';
import AdminRecuperacionesPage from './pages/AdminRecuperacionesPage';
import ValidarCasosPage from './pages/ValidarCasosPage';

import './index.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Routes>
        {/* ============================================================
            RUTAS PÚBLICAS
            ============================================================ */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />

        {/* ============================================================
            RUTAS PROTEGIDAS PARA CLIENTES
            ============================================================ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cuentas" element={<CuentasPage />} />
          <Route path="/transferencias" element={<TransferenciasPage />} />
          <Route path="/tarjeta-cmr" element={<TarjetaCMRPage />} />
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="/pagar-prestamo" element={<PagarPrestamoPage />} />
          <Route path="/pagar-servicios" element={<PagarServiciosPage />} />
          <Route path="/solicitar-credito" element={<SolicitarCreditoPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* ============================================================
            RUTAS PROTEGIDAS PARA ADMINISTRADORES
            ============================================================ */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/creditos" element={<AdminCreditosPage />} />
          <Route path="/admin/prestamos" element={<AdminPrestamosPage />} />
          <Route path="/admin/recuperaciones" element={<AdminRecuperacionesPage />} />
          <Route path="/admin/validar-casos" element={<ValidarCasosPage />} />
        </Route>

        {/* ============================================================
            REDIRECCIONES
            ============================================================ */}
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin/creditos" />} />
        <Route path="/transfer" element={<Navigate to="/transferencias" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
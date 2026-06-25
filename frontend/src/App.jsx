import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage';
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
import AdminCreditosPage from './pages/AdminCreditosPage';
import AdminPrestamosPage from './pages/AdminPrestamosPage';
import AdminRecuperacionesPage from './pages/AdminRecuperacionesPage';
import ValidarCasosPage from './pages/ValidarCasosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />

        {/* Protegidas - Cliente */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/cuentas" element={<ProtectedRoute><CuentasPage /></ProtectedRoute>} />
        <Route path="/transferencias" element={<ProtectedRoute><TransferenciasPage /></ProtectedRoute>} />
        <Route path="/tarjeta-cmr" element={<ProtectedRoute><TarjetaCMRPage /></ProtectedRoute>} />
        <Route path="/prestamos" element={<ProtectedRoute><PrestamosPage /></ProtectedRoute>} />
        <Route path="/pagar-prestamo" element={<ProtectedRoute><PagarPrestamoPage /></ProtectedRoute>} />
        <Route path="/pagar-servicios" element={<ProtectedRoute><PagarServiciosPage /></ProtectedRoute>} />
        <Route path="/solicitar-credito" element={<ProtectedRoute><SolicitarCreditoPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />

        {/* Protegidas - ADMIN */}
        <Route path="/admin/creditos" element={<AdminRoute><AdminCreditosPage /></AdminRoute>} />
        <Route path="/admin/prestamos" element={<AdminRoute><AdminPrestamosPage /></AdminRoute>} />
        <Route path="/admin/recuperaciones" element={<AdminRoute><AdminRecuperacionesPage /></AdminRoute>} />
        <Route path="/admin/validar-casos" element={<AdminRoute><ValidarCasosPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
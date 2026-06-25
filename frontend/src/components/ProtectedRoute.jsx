import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Si es admin, redirigir al panel admin
  const usuario = authService.getUsuario();
  if (usuario?.tipo_usuario === 'admin') {
    return <Navigate to="/admin/creditos" replace />;
  }
  
  return children;
}
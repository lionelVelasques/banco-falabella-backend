import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function AdminRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin-login" replace />;
  }
  
  const usuario = authService.getUsuario();
  if (usuario?.tipo_usuario !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
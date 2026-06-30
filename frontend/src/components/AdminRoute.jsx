import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function AdminRoute({ children }) {
  const usuario = authService.getUsuario();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (usuario?.tipo_usuario !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
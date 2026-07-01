import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  const usuario = authService.getUsuario();
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (usuario?.tipo_usuario === 'admin') {
    return <Navigate to="/admin/creditos" replace />;
  }
  
  return children;
}
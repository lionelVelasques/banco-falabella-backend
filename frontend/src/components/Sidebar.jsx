import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from './Logo';

// Menú exclusivo para CLIENTES
const clientNav = [
  { to: '/dashboard', icon: '🏠', label: 'Inicio' },
  { to: '/cuentas', icon: '💳', label: 'Mis Cuentas' },
  { to: '/transferencias', icon: '🔄', label: 'Transferencias' },
  { to: '/tarjeta-cmr', icon: '💎', label: 'Tarjeta CMR' },
  { to: '/prestamos', icon: '📈', label: 'Mis Préstamos' },
  { to: '/pagar-prestamo', icon: '💰', label: 'Pagar Préstamo' },
  { to: '/pagar-servicios', icon: '⚡', label: 'Pagar Servicios' },
  { to: '/solicitar-credito', icon: '📋', label: 'Solicitar Crédito' },
  { to: '/analytics', icon: '📊', label: 'Análisis' },
  { to: '/perfil', icon: '👤', label: 'Mi Perfil' },
];

// Menú exclusivo para ADMINISTRADORES
const adminNav = [
  { to: '/admin/creditos', icon: '⚖️', label: 'Evaluar Créditos' },
  { to: '/admin/prestamos', icon: '📋', label: 'Validar Préstamos' },
  { to: '/admin/recuperaciones', icon: '🔄', label: 'Recuperaciones' },
  { to: '/admin/validar-casos', icon: '✅', label: 'Validar Casos' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const usuario = authService.getUsuario();
  const isAdmin = usuario?.tipo_usuario === 'admin';
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    // ✅ Usar replace para que no se guarde en el historial
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated) return null;

  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      borderRight: '1px solid #1F2937',
    }}>
      <div style={{
        padding: '20px 24px 20px',
        borderBottom: '1px solid #1F2937',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Logo size="sm" linkTo={isAdmin ? '/admin/creditos' : '/dashboard'} />
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {isAdmin ? (
          <>
            <div style={{
              color: '#FF6B35',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              paddingLeft: 14,
              marginBottom: 12,
              fontWeight: 700,
            }}>
              👑 Panel de Administración
            </div>
            {adminNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 2,
                  color: isActive ? 'white' : '#9CA3AF',
                  background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  borderLeft: isActive ? '3px solid #FF6B35' : '3px solid transparent',
                })}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            <div style={{
              borderTop: '1px solid #1F2937',
              margin: '16px 0 12px',
              paddingTop: 12,
              color: '#6B7280',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              paddingLeft: 14,
            }}>
              📱 Acceso Rápido
            </div>

            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 2,
                color: isActive ? 'white' : '#9CA3AF',
                background: isActive ? 'rgba(0, 165, 80, 0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                borderLeft: isActive ? '3px solid #00A550' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 18 }}>🏠</span>
              Ver Dashboard Cliente
            </NavLink>
          </>
        ) : (
          <>
            {clientNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 2,
                  color: isActive ? 'white' : '#9CA3AF',
                  background: isActive ? 'rgba(0, 165, 80, 0.15)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  borderLeft: isActive ? '3px solid #00A550' : '3px solid transparent',
                })}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div style={{ padding: '0 12px 16px' }}>
        <div style={{
          background: '#1F2937',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 10,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: isAdmin 
                ? 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)'
                : 'linear-gradient(135deg, #00A550 0%, #007A3A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
            }}>
              {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>
                {usuario?.nombre} {usuario?.apellido}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#6B7280',
                fontSize: 11,
              }}>
                {isAdmin ? '👑 Administrador' : '👤 Cliente'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            color: '#EF4444',
            border: '1px solid #374151',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.borderColor = '#EF4444';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = '#374151';
          }}
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
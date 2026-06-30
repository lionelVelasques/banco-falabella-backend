import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, contraseña);
      if (data.usuario?.tipo_usuario !== 'admin') {
        setError('❌ Acceso denegado. Esta página es solo para administradores.');
        authService.logout();
        setLoading(false);
        return;
      }
      navigate('/admin/creditos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0D1117',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        color: 'white',
        background: 'linear-gradient(135deg, #0D1117 0%, #003D1F 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 107, 53, 0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 48 }}>
            <Logo size="lg" linkTo="/" />
          </div>

          <h1 style={{
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 16,
            letterSpacing: -1,
          }}>
            Panel de<br />
            <span style={{ color: '#FF6B35' }}>Administración</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 16, maxWidth: 380, lineHeight: 1.7 }}>
            Accede al panel de control para gestionar créditos, recuperaciones y validar casos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
            {[
              '⚖️ Evaluar solicitudes de crédito',
              '🔄 Gestionar cartera morosa',
              '✅ Validar casos de prueba',
              '📊 Dashboard administrativo',
            ].map(t => (
              <div key={t} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#D1D5DB',
                fontSize: 14,
              }}>
                <span style={{ fontSize: 18 }}>{t.split(' ')[0]}</span>
                <span>{t.substring(t.indexOf(' ') + 1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        width: 460,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: 'white',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              👑 Acceso Administrativo
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
              Ingresa con tus credenciales de administrador
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="admin@bancofalabella.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert-error" style={{ marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
              }}
            >
              {loading ? 'Ingresando...' : '👑 Ingresar al Panel Admin'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: '#6B7280', fontSize: 13 }}>
              ¿Eres cliente?{' '}
              {/* ✅ CORREGIDO: Usar Link en lugar de <a> */}
              <Link 
                to="/login" 
                style={{ color: '#00A550', fontWeight: 600, textDecoration: 'none' }}
              >
                Ir a Banca Digital
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
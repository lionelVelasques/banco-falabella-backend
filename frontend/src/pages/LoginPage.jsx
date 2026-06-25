import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

export default function LoginPage() {
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
      // Redirigir según el rol
      if (data.usuario?.tipo_usuario === 'admin') {
        navigate('/admin/creditos');
      } else {
        navigate('/dashboard');
      }
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
          background: 'rgba(0, 165, 80, 0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(0, 165, 80, 0.03)',
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
            Banca digital<br />
            <span style={{ color: '#00A550' }}>siempre contigo</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 16, maxWidth: 380, lineHeight: 1.7 }}>
            Gestiona tus cuentas, tarjetas y préstamos desde un solo lugar, con la seguridad y confianza de siempre.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
            {[
              '🔒 Seguridad bancaria de primer nivel',
              '💳 Tarjeta CMR sin costo de emisión',
              '🏦 Préstamos con aprobación rápida',
              '📱 Acceso 24/7 desde cualquier dispositivo',
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
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Bienvenido</h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: '#00A550', fontWeight: 600, textDecoration: 'none' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
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
                background: 'linear-gradient(135deg, #00A550 0%, #007A3A 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(0, 165, 80, 0.3)',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar a mi cuenta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link
              to="/recuperar-password"
              style={{
                color: '#6B7280',
                fontSize: 13,
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.target.style.color = '#00A550'}
              onMouseLeave={e => e.target.style.color = '#6B7280'}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await authService.solicitarRecuperacion(email);
      setEnviado(true);
      setMsg({ type: 'ok', text: '✅ Se ha enviado un enlace de recuperación a tu correo' });
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D1117 0%, #003D1F 100%)',
      padding: '32px 16px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '40px 48px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo size="lg" linkTo="/" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0D1117', marginBottom: 4 }}>
            {enviado ? '📧 Revisa tu correo' : '🔑 Recuperar contraseña'}
          </h2>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            {enviado 
              ? 'Te hemos enviado un enlace para restablecer tu contraseña' 
              : 'Ingresa tu correo y te enviaremos un enlace de recuperación'
            }
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {msg.text && (
              <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 16 }}>
                {msg.text}
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
              }}
            >
              {loading ? 'Enviando...' : '📩 Enviar enlace de recuperación'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>
              {msg.text}
            </p>
            <Link
              to="/login"
              style={{
                color: '#00A550',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Volver al login
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            to="/login"
            style={{
              color: '#9CA3AF',
              fontSize: 13,
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.target.style.color = '#00A550'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
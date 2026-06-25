import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    contraseña: '',
    confirmar: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.contraseña !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    try {
      const { confirmar, ...payload } = form;
      await authService.register(payload);
      navigate('/dashboard');
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
        maxWidth: 560,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Logo size="lg" linkTo="/" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0D1117', marginBottom: 4 }}>
            Abre tu cuenta
          </h2>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#00A550', fontWeight: 600, textDecoration: 'none' }}>
              Ingresa aquí
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                placeholder="Juan"
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                placeholder="Pérez"
                value={form.apellido}
                onChange={e => set('apellido', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>DNI</label>
              <input
                placeholder="12345678"
                maxLength={8}
                value={form.dni}
                onChange={e => set('dni', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                placeholder="987654321"
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={e => set('fecha_nacimiento', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.contraseña}
                onChange={e => set('contraseña', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmar}
                onChange={e => set('confirmar', e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 16,
            }}>
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            to="/register-admin"
            style={{
              color: '#9CA3AF',
              fontSize: 12,
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.target.style.color = '#00A550'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}
          >
            👑 Crear administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
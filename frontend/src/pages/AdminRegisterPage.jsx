import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function AdminRegisterPage() {
  const [form, setForm] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
    confirmar: '',
    rol: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
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
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--gris-100)', padding: '32px 16px',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--verde)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'white', margin: '0 auto 12px',
          }}>F</div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Crear Administrador</h2>
          <p style={{ color: 'var(--gris-500)', fontSize: 13, marginTop: 4 }}>
            <Link to="/login" style={{ color: 'var(--verde)', fontWeight: 600 }}>Volver al login</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input 
                placeholder="Admin" 
                value={form.nombre} 
                onChange={e => set('nombre', e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input 
                placeholder="Falabella" 
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
                placeholder="99999999" 
                maxLength={8} 
                value={form.dni} 
                onChange={e => set('dni', e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input 
                placeholder="999000000" 
                value={form.telefono} 
                onChange={e => set('telefono', e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              placeholder="admin@bancofalabella.pe" 
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
                value={form.password} 
                onChange={e => set('password', e.target.value)} 
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

          <div style={{ 
            background: '#FEF3C7', 
            border: '1px solid #FCD34D', 
            borderRadius: 8, 
            padding: '10px 14px', 
            marginBottom: 16,
            fontSize: 13,
            color: '#92400E'
          }}>
            ⚠️ Esta página solo debe ser accesible para crear el primer administrador.
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FECACA',
              color: '#991B1B', borderRadius: 8, padding: '10px 14px',
              fontSize: 13, marginBottom: 16,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando admin...' : '👑 Crear Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}
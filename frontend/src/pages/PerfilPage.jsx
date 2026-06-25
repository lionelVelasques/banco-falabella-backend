import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { authService, api } from '../services/authService';

export default function PerfilPage() {
  const usuario = authService.getUsuario();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
      });
    }
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await authService.actualizarPerfil(form);
      setMsg({ type: 'ok', text: '✅ Perfil actualizado exitosamente' });
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.nuevaPassword !== passwordForm.confirmarPassword) {
      setPasswordMsg({ type: 'err', text: '❌ Las contraseñas no coinciden' });
      return;
    }
    if (passwordForm.nuevaPassword.length < 6) {
      setPasswordMsg({ type: 'err', text: '❌ La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    setLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await authService.cambiarPassword(passwordForm.passwordActual, passwordForm.nuevaPassword);
      setPasswordMsg({ type: 'ok', text: '✅ Contraseña cambiada exitosamente' });
      setPasswordForm({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Mi Perfil</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
        Gestiona tu información personal y seguridad
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Datos personales */}
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: '#111827' }}>
            👤 Datos personales
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                disabled
                style={{ background: '#F3F4F6' }}
              />
              <span style={{ fontSize: 11, color: '#6B7280' }}>El correo no se puede cambiar</span>
            </div>

            {msg.text && (
              <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                {msg.text}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: '#111827' }}>
            🔐 Cambiar contraseña
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.passwordActual}
                onChange={e => setPasswordForm({ ...passwordForm, passwordActual: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.nuevaPassword}
                onChange={e => setPasswordForm({ ...passwordForm, nuevaPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmarPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmarPassword: e.target.value })}
                required
              />
            </div>

            {passwordMsg.text && (
              <div className={passwordMsg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                {passwordMsg.text}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : '🔑 Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>

      {/* Información de cuenta */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#111827' }}>
          📋 Información de cuenta
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
          <div>
            <strong>Rol:</strong> {usuario?.rol === 'admin' ? '👑 Administrador' : '👤 Cliente'}
          </div>
          <div>
            <strong>Estado:</strong> <span className="badge badge-verde">Activo</span>
          </div>
          <div>
            <strong>Último login:</strong> {usuario?.ultimo_login ? new Date(usuario.ultimo_login).toLocaleDateString('es-PE') : 'N/A'}
          </div>
        </div>
      </div>
    </Layout>
  );
}
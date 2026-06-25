import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const serviciosDisponibles = [
  { id: 'luz', nombre: '⚡ Luz', icon: '💡' },
  { id: 'agua', nombre: '💧 Agua', icon: '🚿' },
  { id: 'telefono', nombre: '📞 Teléfono fijo', icon: '📱' },
  { id: 'internet', nombre: '🌐 Internet', icon: '📶' },
  { id: 'gas', nombre: '🔥 Gas', icon: '🫕' },
  { id: 'cable', nombre: '📺 Cable', icon: '🖥️' },
];

export default function PagarServiciosPage() {
  const [cuentas, setCuentas] = useState([]);
  const [servicio, setServicio] = useState('');
  const [cuentaOrigen, setCuentaOrigen] = useState('');
  const [monto, setMonto] = useState('');
  const [codigoServicio, setCodigoServicio] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    api.get('/cuentas').then(d => setCuentas(d.cuentas || [])).catch(console.error);
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const data = await api.get('/pagos-servicios/historial');
      setHistorial(data.pagos || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const data = await api.post('/pagos-servicios/pagar', {
        servicio,
        cuenta_origen_id: cuentaOrigen,
        monto: parseFloat(monto),
        codigo_servicio: codigoServicio,
      });
      setMsg({ type: 'ok', text: `✅ ${data.message}` });
      setMonto('');
      setCodigoServicio('');
      await cargarHistorial();
      // Recargar cuentas para actualizar saldo
      const cuentasData = await api.get('/cuentas');
      setCuentas(cuentasData.cuentas || []);
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Pago de Servicios</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
        Paga tus servicios de forma rápida y segura
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
        {/* Formulario */}
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18, color: '#111827' }}>
            📝 Nuevo pago
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Servicio</label>
              <select value={servicio} onChange={e => setServicio(e.target.value)} required>
                <option value="">Selecciona un servicio</option>
                {serviciosDisponibles.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Código de servicio / N° de contrato</label>
              <input
                placeholder="Ej: 123456789"
                value={codigoServicio}
                onChange={e => setCodigoServicio(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Cuenta de débito</label>
              <select value={cuentaOrigen} onChange={e => setCuentaOrigen(e.target.value)} required>
                <option value="">Selecciona una cuenta</option>
                {cuentas.filter(c => c.tipo === 'ahorro' || c.tipo === 'corriente').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tipo.toUpperCase()} — {c.numero_cuenta?.slice(-6)} — {fmt(c.saldo_disponible)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto (S/)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                required
              />
            </div>

            {msg.text && (
              <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                {msg.text}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Procesando...' : '💳 Pagar servicio'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>📜 Historial de pagos</h3>
          </div>
          {historial.length ? historial.map((p, i) => (
            <div key={p.id} style={{
              padding: '12px 20px',
              borderBottom: i < historial.length - 1 ? '1px solid #F3F4F6' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {p.servicio_nombre || p.servicio}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {p.codigo_servicio} · {new Date(p.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#E31837' }}>
                {fmt(p.monto)}
              </div>
            </div>
          )) : (
            <div className="empty-state"><span>📭</span>Sin pagos de servicios</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
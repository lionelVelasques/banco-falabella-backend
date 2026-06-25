import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function PagarPrestamoPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [monto, setMonto] = useState('');
  const [cuentaOrigen, setCuentaOrigen] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      api.get('/prestamos'),
      api.get('/cuentas')
    ]).then(([p, c]) => {
      setPrestamos(p.prestamos || []);
      setCuentas(c.cuentas || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selected) {
      setMonto(selected.saldo_pendiente || selected.monto_aprobado || selected.monto_solicitado);
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const data = await api.post(`/prestamos/${selected.id}/pagar`, {
        cuenta_origen_id: cuentaOrigen,
        monto: parseFloat(monto),
      });
      setMsg({ type: 'ok', text: `✅ ${data.message}` });
      // Recargar préstamos
      const p = await api.get('/prestamos');
      setPrestamos(p.prestamos || []);
      const c = await api.get('/cuentas');
      setCuentas(c.cuentas || []);
      setSelected(null);
      setMonto('');
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const prestamosActivos = prestamos.filter(p => 
    p.estado === 'desembolsado' || p.estado === 'en_mora'
  );

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Pagar Préstamo</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
        Realiza el pago de tus préstamos activos
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Lista de préstamos */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
                📋 Préstamos activos
                <span className="badge badge-verde" style={{ marginLeft: 10 }}>
                  {prestamosActivos.length}
                </span>
              </h3>
            </div>
            {prestamosActivos.length ? prestamosActivos.map((p, i) => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                style={{
                  padding: '14px 20px',
                  cursor: 'pointer',
                  borderBottom: i < prestamosActivos.length - 1 ? '1px solid #F3F4F6' : 'none',
                  background: selected?.id === p.id ? '#E8F7EF' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {p.tipo.toUpperCase()} — {fmt(p.monto_aprobado || p.monto_solicitado)}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      Cuota: {fmt(p.cuota_mensual)} · {p.plazo_meses} meses
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Pendiente</div>
                    <div style={{ fontWeight: 700, color: '#E31837' }}>{fmt(p.saldo_pendiente)}</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state"><span>✅</span>No tienes préstamos activos</div>
            )}
          </div>
        </div>

        {/* Formulario de pago */}
        <div>
          {selected ? (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#111827' }}>
                💰 Pagar préstamo
              </h3>

              <div style={{
                background: '#F9FAFB',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16,
                border: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13 }}>
                  <div><strong>Tipo:</strong> {selected.tipo}</div>
                  <div><strong>Monto original:</strong> {fmt(selected.monto_aprobado || selected.monto_solicitado)}</div>
                  <div><strong>Cuota:</strong> {fmt(selected.cuota_mensual)}</div>
                  <div><strong>Saldo pendiente:</strong> <span style={{ color: '#E31837', fontWeight: 700 }}>{fmt(selected.saldo_pendiente)}</span></div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
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
                  <label>Monto a pagar (S/)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: 11, color: '#6B7280' }}>
                    Saldo pendiente: {fmt(selected.saldo_pendiente)}
                  </span>
                </div>

                {msg.text && (
                  <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                    {msg.text}
                  </div>
                )}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Procesando...' : '💳 Pagar préstamo'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: '#6B7280', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <h4 style={{ color: '#374151' }}>Selecciona un préstamo</h4>
              <p style={{ fontSize: 14 }}>Selecciona un préstamo de la lista para pagar</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
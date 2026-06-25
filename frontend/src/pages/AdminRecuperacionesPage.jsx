import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const bandaColors = {
  preventiva: 'badge-preventiva',
  temprana: 'badge-temprana',
  tardia: 'badge-tardia',
  judicial: 'badge-judicial',
  castigo: 'badge-castigo'
};

const bandaLabels = {
  preventiva: '🟢 Preventiva (1-30 días)',
  temprana: '🟡 Temprana (31-60 días)',
  tardia: '🟠 Tardía (61-90 días)',
  judicial: '🔴 Judicial (91-120 días)',
  castigo: '⚫ Castigo (>120 días)'
};

export default function AdminRecuperacionesPage() {
  const [mora, setMora] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [filtroBanda, setFiltroBanda] = useState('');
  const [selected, setSelected] = useState(null);
  const [gestiones, setGestiones] = useState([]);
  const [formGestion, setFormGestion] = useState({
    tipo_gestion: 'llamada',
    resultado: 'contacto',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const cargar = () => {
    const url = filtroBanda ? `/recuperaciones/mora?banda=${filtroBanda}` : '/recuperaciones/mora';
    Promise.all([
      api.get(url),
      api.get('/recuperaciones/kpis')
    ]).then(([m, k]) => {
      setMora(m.mora);
      setKpis(k.kpis);
    }).catch(console.error);
  };

  useEffect(() => { cargar(); }, [filtroBanda]);

  useEffect(() => {
    if (selected) {
      api.get(`/recuperaciones/${selected.cartera_id}/gestiones`)
        .then(d => setGestiones(d.gestiones))
        .catch(console.error);
    }
  }, [selected]);

  const registrarGestion = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await api.post(`/recuperaciones/${selected.cartera_id}/gestion`, formGestion);
      setMsg({ type: 'ok', text: '✅ Gestión registrada exitosamente' });
      setFormGestion({ tipo_gestion: 'llamada', resultado: 'contacto', descripcion: '' });
      cargar();
      const d = await api.get(`/recuperaciones/${selected.cartera_id}/gestiones`);
      setGestiones(d.gestiones);
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const derivarJudicial = async () => {
    if (!selected || !confirm(`¿Derivar a judicial a ${selected.cliente}?`)) return;
    setLoading(true);
    try {
      const data = await api.post(`/recuperaciones/${selected.cartera_id}/derivar-judicial`);
      setMsg({ type: 'ok', text: '✅ ' + data.message });
      cargar();
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const castigar = async () => {
    if (!selected || !confirm(`¿Castigar cartera de ${selected.cliente}? Esta acción es irreversible.`)) return;
    setLoading(true);
    try {
      const data = await api.post(`/recuperaciones/${selected.cartera_id}/castigar`);
      setMsg({ type: 'ok', text: '✅ ' + data.message });
      cargar();
    } catch (err) {
      setMsg({ type: 'err', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Recuperaciones
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>
          Gestión de cartera morosa
        </p>
      </div>

      {/* KPIs con diseño mejorado */}
      {kpis && (
        <div className="grid-5" style={{ marginBottom: 24 }}>
          {[
            { key: 'preventiva', label: 'Preventiva', color: '#00A550', icon: '🟢' },
            { key: 'temprana', label: 'Temprana', color: '#F59E0B', icon: '🟡' },
            { key: 'tardia', label: 'Tardía', color: '#F97316', icon: '🟠' },
            { key: 'judicial', label: 'Judicial', color: '#EF4444', icon: '🔴' },
            { key: 'castigo', label: 'Castigo', color: '#6B7280', icon: '⚫' },
          ].map(b => (
            <div key={b.key} className="kpi-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: b.color }}>
                {kpis?.[b.key] || 0}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{b.icon} {b.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: b.color }}>
                {fmt(kpis?.[`monto_${b.key}`] || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Lista de mora */}
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filtroBanda}
              onChange={e => setFiltroBanda(e.target.value)}
              style={{ width: 'auto', minWidth: 180 }}
            >
              <option value="">Todas las bandas</option>
              <option value="preventiva">🟢 Preventiva</option>
              <option value="temprana">🟡 Temprana</option>
              <option value="tardia">🟠 Tardía</option>
              <option value="judicial">🔴 Judicial</option>
            </select>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              Total: <strong>{mora.length}</strong> registros
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', maxHeight: 500, overflowY: 'auto' }}>
            {mora.length ? mora.map((m, i) => (
              <div
                key={m.cartera_id}
                onClick={() => setSelected(m)}
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  borderBottom: i < mora.length - 1 ? '1px solid #F3F4F6' : 'none',
                  background: selected?.cartera_id === m.cartera_id ? '#E8F7EF' : 'white',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (selected?.cartera_id !== m.cartera_id) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={e => {
                  if (selected?.cartera_id !== m.cartera_id) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                      {m.cliente}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {fmt(m.saldo_pendiente)} · {m.dias_atraso} días de atraso
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${bandaColors[m.banda]}`}>
                      {m.banda}
                    </span>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      {m.total_gestiones || 0} gestiones
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <span>✅</span>
                <h4>Sin cartera morosa</h4>
                <p>No hay registros de mora en esta banda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalle y acciones */}
        <div>
          {selected ? (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#111827' }}>
                Detalle de cartera
              </h3>

              <div style={{
                background: '#F9FAFB',
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 16,
                border: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 13 }}>
                  <div><strong>Cliente:</strong> {selected.cliente}</div>
                  <div><strong>Email:</strong> {selected.email}</div>
                  <div><strong>Teléfono:</strong> {selected.telefono || 'N/A'}</div>
                  <div><strong>Saldo:</strong> <span style={{ fontWeight: 700, color: '#E31837' }}>{fmt(selected.saldo_pendiente)}</span></div>
                  <div><strong>Días atraso:</strong> <span style={{ fontWeight: 700 }}>{selected.dias_atraso}</span></div>
                  <div><strong>Banda:</strong> <span className={`badge ${bandaColors[selected.banda]}`}>{bandaLabels[selected.banda]}</span></div>
                  <div><strong>Vencimiento:</strong> {selected.fecha_vencimiento ? new Date(selected.fecha_vencimiento).toLocaleDateString('es-PE') : 'N/A'}</div>
                  <div><strong>Gestiones:</strong> {selected.total_gestiones || 0}</div>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {selected.dias_atraso >= 91 && selected.estado_cartera !== 'judicial' && (
                  <button
                    onClick={derivarJudicial}
                    className="btn-warning"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                    disabled={loading}
                  >
                    ⚖️ Derivar a judicial
                  </button>
                )}
                {selected.dias_atraso >= 120 && selected.estado_cartera !== 'castigada' && (
                  <button
                    onClick={castigar}
                    className="btn-danger"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                    disabled={loading}
                  >
                    💀 Castigar cartera
                  </button>
                )}
              </div>

              {/* Registrar gestión */}
              <form onSubmit={registrarGestion}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Tipo de gestión</label>
                    <select
                      value={formGestion.tipo_gestion}
                      onChange={e => setFormGestion(f => ({ ...f, tipo_gestion: e.target.value }))}
                    >
                      <option value="llamada">📞 Llamada</option>
                      <option value="email">✉️ Email</option>
                      <option value="visita">👤 Visita</option>
                      <option value="carta">📨 Carta</option>
                      <option value="sms">📱 SMS</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Resultado</label>
                    <select
                      value={formGestion.resultado}
                      onChange={e => setFormGestion(f => ({ ...f, resultado: e.target.value }))}
                    >
                      <option value="contacto">📞 Contacto</option>
                      <option value="promesa_pago">🤝 Promesa de pago</option>
                      <option value="no_contacto">📵 Sin contacto</option>
                      <option value="pago_parcial">💰 Pago parcial</option>
                      <option value="derivado">↗️ Derivado</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    rows="2"
                    placeholder="Detalles de la gestión..."
                    value={formGestion.descripcion}
                    onChange={e => setFormGestion(f => ({ ...f, descripcion: e.target.value }))}
                  />
                </div>

                {msg.text && (
                  <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                    {msg.text}
                  </div>
                )}

                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : '📝 Registrar gestión'}
                </button>
              </form>

              {/* Historial de gestiones */}
              {gestiones.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#111827' }}>
                    Historial de gestiones
                  </h4>
                  {gestiones.map(g => (
                    <div key={g.id} style={{
                      background: '#F9FAFB',
                      borderRadius: 10,
                      padding: '10px 14px',
                      marginBottom: 6,
                      fontSize: 13,
                      border: '1px solid #F3F4F6',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <strong>{g.tipo_gestion}</strong> · {g.resultado}
                        </span>
                        <span style={{ color: '#6B7280', fontSize: 11 }}>
                          {new Date(g.created_at).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {g.descripcion && (
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{g.descripcion}</div>
                      )}
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Gestor: {g.gestor}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: '#6B7280', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <h4 style={{ color: '#374151', marginBottom: 4 }}>Selecciona un registro</h4>
              <p style={{ fontSize: 14 }}>Selecciona un registro de mora para gestionar</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
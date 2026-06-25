import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function AdminCreditosPage() {
  const [pendientes, setPendientes] = useState([]);
  const [pendientesComite, setPendientesComite] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    monto_aprobado: '',
    tasa_interes: 18,
    plazo_meses: 12,
    observaciones: '',
    accion: 'aprobar'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const cargar = () => {
    Promise.all([
      api.get('/creditos/pendientes'),
      api.get('/creditos/pendientes-comite')
    ]).then(([p, c]) => {
      setPendientes(p.pendientes);
      setPendientesComite(c.pendientes_comite);
    }).catch(console.error);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (selected) {
      setForm({
        monto_aprobado: selected.monto_solicitado,
        tasa_interes: 18,
        plazo_meses: selected.plazo_meses || 12,
        observaciones: '',
        accion: 'aprobar'
      });
    }
  }, [selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const data = await api.post(`/creditos/${selected.solicitud_id}/aprobar`, {
        ...form,
        monto_aprobado: parseFloat(form.monto_aprobado),
        plazo_meses: parseInt(form.plazo_meses)
      });
      setMsg({ type: 'ok', text: data.message });
      setSelected(null);
      cargar();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getNivelAprobacion = (monto) => {
    if (monto <= 10000) return '🟢 Admin';
    if (monto <= 50000) return '🟡 Jefe Riesgos';
    if (monto <= 200000) return '🟠 Comité';
    return '🔴 Gerencia General';
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Evaluación de Créditos</h1>
      <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 28 }}>
        Administra las solicitudes de crédito pendientes
      </p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--verde)' }}>
            {pendientes.length}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gris-500)' }}>Pendientes de evaluación</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--rojo)' }}>
            {pendientesComite.length}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gris-500)' }}>Requieren comité (&gt; S/ 50k)</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--verde)' }}>
            {pendientes.filter(p => p.elegibilidad).length}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gris-500)' }}>Pre-aprobados por scoring</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Lista de pendientes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gris-100)', fontWeight: 700 }}>
            Solicitudes pendientes
          </div>
          {pendientes.length ? pendientes.map((p, i) => (
            <div
              key={p.solicitud_id}
              onClick={() => setSelected(p)}
              style={{
                padding: '14px 20px',
                cursor: 'pointer',
                borderBottom: i < pendientes.length - 1 ? '1px solid var(--gris-100)' : 'none',
                background: selected?.solicitud_id === p.solicitud_id ? 'var(--verde-claro)' : 'white',
                transition: 'background 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.cliente}</div>
                  <div style={{ fontSize: 12, color: 'var(--gris-500)' }}>
                    {fmt(p.monto_solicitado)} · {p.tipo}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12 }}>
                    Scoring: <strong>{p.puntaje_scoring || 'N/A'}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: p.elegibilidad ? 'var(--verde)' : 'var(--rojo)' }}>
                    {p.elegibilidad ? '✅ Elegible' : '❌ No elegible'}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state"><span>✅</span>No hay solicitudes pendientes</div>
          )}
        </div>

        {/* Detalle y aprobación */}
        <div>
          {selected ? (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                Evaluar solicitud
              </h3>

              <div style={{ background: 'var(--gris-100)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><strong>Cliente:</strong> {selected.cliente}</div>
                  <div><strong>Email:</strong> {selected.email}</div>
                  <div><strong>Monto:</strong> {fmt(selected.monto_solicitado)}</div>
                  <div><strong>Tipo:</strong> {selected.tipo}</div>
                  <div><strong>Plazo:</strong> {selected.plazo_meses} meses</div>
                  <div><strong>Scoring:</strong> {selected.puntaje_scoring || 'N/A'}/100</div>
                  <div><strong>RDS:</strong> {selected.rds || 'N/A'}%</div>
                  <div><strong>Nivel:</strong> {getNivelAprobacion(selected.monto_solicitado)}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Monto a aprobar (S/)</label>
                  <input
                    type="number"
                    value={form.monto_aprobado}
                    onChange={e => setForm(f => ({ ...f, monto_aprobado: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Tasa interés (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.tasa_interes}
                      onChange={e => setForm(f => ({ ...f, tasa_interes: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Plazo (meses)</label>
                    <input
                      type="number"
                      value={form.plazo_meses}
                      onChange={e => setForm(f => ({ ...f, plazo_meses: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    rows="2"
                    placeholder="Motivo de aprobación/rechazo..."
                    value={form.observaciones}
                    onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                    onClick={() => setForm(f => ({ ...f, accion: 'aprobar' }))}
                  >
                    {loading ? 'Procesando...' : '✅ Aprobar'}
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'var(--rojo)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 14,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    disabled={loading}
                    onClick={() => setForm(f => ({ ...f, accion: 'rechazar' }))}
                  >
                    {loading ? 'Procesando...' : '❌ Rechazar'}
                  </button>
                </div>

                {msg.text && (
                  <div style={{
                    marginTop: 12,
                    background: msg.type === 'ok' ? 'var(--verde-claro)' : '#FEE2E2',
                    color: msg.type === 'ok' ? 'var(--verde-oscuro)' : '#991B1B',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13
                  }}>
                    {msg.text}
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--gris-500)', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <div>Selecciona una solicitud para evaluar</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
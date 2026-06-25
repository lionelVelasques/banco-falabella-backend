import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function SolicitarCreditoPage() {
  const [form, setForm] = useState({
    monto_solicitado: '',
    tipo: 'personal',
    plazo_meses: 12,
    ingreso_mensual: '',
    deuda_mensual: 0
  });
  const [simulacion, setSimulacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [solicitudes, setSolicitudes] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Cargar solicitudes existentes
  useEffect(() => {
    api.get('/creditos/mis-solicitudes')
      .then(d => setSolicitudes(d.solicitudes))
      .catch(console.error);
  }, []);

  // Simular cuota
  useEffect(() => {
    if (form.monto_solicitado && form.plazo_meses && form.ingreso_mensual) {
      const tasas = { personal: 18, vehicular: 12, hipotecario: 9, consumo: 24 };
      const tasa = tasas[form.tipo] || 18;
      const i = tasa / 100 / 12;
      const n = parseInt(form.plazo_meses);
      const monto = parseFloat(form.monto_solicitado);
      const ingreso = parseFloat(form.ingreso_mensual);
      if (monto > 0 && n > 0 && ingreso > 0) {
        const cuota = (monto * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        const rds = (cuota / ingreso) * 100;
        setSimulacion({
          cuota: cuota.toFixed(2),
          tasa,
          total: (cuota * n).toFixed(2),
          rds: rds.toFixed(1),
          rdsNivel: rds < 20 ? '🟢 Bajo' : rds < 35 ? '🟡 Moderado' : '🔴 Alto'
        });
      }
    }
  }, [form.monto_solicitado, form.plazo_meses, form.tipo, form.ingreso_mensual]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const data = await api.post('/creditos/solicitar', {
        ...form,
        monto_solicitado: parseFloat(form.monto_solicitado),
        plazo_meses: parseInt(form.plazo_meses),
        ingreso_mensual: parseFloat(form.ingreso_mensual),
        deuda_mensual: parseFloat(form.deuda_mensual || 0)
      });

      setMsg({
        type: data.solicitud.estado === 'rechazado' ? 'err' : 'ok',
        text: data.message
      });

      // Recargar solicitudes
      const updated = await api.get('/creditos/mis-solicitudes');
      setSolicitudes(updated.solicitudes);

      // Si fue aceptada, mostrar evaluación
      if (data.evaluacion) {
        setMsg(prev => ({
          ...prev,
          text: `${prev.text} | Scoring: ${data.evaluacion.scoring}/100 | RDS: ${data.evaluacion.rds}% | Riesgo: ${data.evaluacion.nivel_riesgo}`
        }));
      }

      // Limpiar formulario si fue exitoso
      if (data.solicitud.estado !== 'rechazado') {
        setForm({
          monto_solicitado: '',
          tipo: 'personal',
          plazo_meses: 12,
          ingreso_mensual: '',
          deuda_mensual: 0
        });
        setSimulacion(null);
      }
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const estadoBadge = (e) => ({
    pendiente: 'badge-gris',
    en_evaluacion: 'badge-amarillo',
    aprobado: 'badge-verde',
    rechazado: 'badge-rojo',
    desembolsado: 'badge-verde'
  }[e] || 'badge-gris');

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Solicitar Crédito</h1>
      <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 28 }}>
        Completa el formulario para solicitar financiamiento
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
        {/* Formulario */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 16 }}>Datos de la solicitud</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de crédito</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="personal">Personal — 18% anual</option>
                <option value="consumo">Consumo — 24% anual</option>
                <option value="vehicular">Vehicular — 12% anual</option>
                <option value="hipotecario">Hipotecario — 9% anual</option>
              </select>
            </div>

            <div className="form-group">
              <label>Monto solicitado (S/)</label>
              <input
                type="number"
                min="500"
                placeholder="Ej: 5000"
                value={form.monto_solicitado}
                onChange={e => set('monto_solicitado', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Plazo (meses)</label>
              <select value={form.plazo_meses} onChange={e => set('plazo_meses', e.target.value)}>
                {[6, 12, 18, 24, 36, 48, 60].map(p => (
                  <option key={p} value={p}>{p} meses</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ingreso mensual neto (S/)</label>
              <input
                type="number"
                placeholder="Ej: 3000"
                value={form.ingreso_mensual}
                onChange={e => set('ingreso_mensual', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Deuda mensual actual (S/)</label>
              <input
                type="number"
                placeholder="Ej: 500"
                value={form.deuda_mensual}
                onChange={e => set('deuda_mensual', e.target.value)}
              />
            </div>

            {/* Simulación */}
            {simulacion && (
              <div style={{
                background: 'var(--verde-claro)',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 700, color: 'var(--verde-oscuro)', marginBottom: 8, fontSize: 13 }}>
                  📊 Simulación
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13 }}>
                  <div>Cuota mensual: <strong>{fmt(simulacion.cuota)}</strong></div>
                  <div>Total a pagar: <strong>{fmt(simulacion.total)}</strong></div>
                  <div>Tasa: {simulacion.tasa}% anual</div>
                  <div>RDS: <strong>{simulacion.rdsNivel}</strong></div>
                </div>
              </div>
            )}

            {msg.text && (
              <div style={{
                background: msg.type === 'ok' ? 'var(--verde-claro)' : '#FEE2E2',
                color: msg.type === 'ok' ? 'var(--verde-oscuro)' : '#991B1B',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 12,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Enviando solicitud...' : 'Solicitar crédito →'}
            </button>
          </form>
        </div>

        {/* Historial de solicitudes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gris-100)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Mis solicitudes</h3>
          </div>
          {solicitudes.length ? solicitudes.map((s, i) => (
            <div key={s.solicitud_id || s.id} style={{
              padding: '14px 24px',
              borderBottom: i < solicitudes.length - 1 ? '1px solid var(--gris-100)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className={`badge ${estadoBadge(s.estado)}`} style={{ marginBottom: 4 }}>
                    {s.estado?.toUpperCase() || 'PENDIENTE'}
                  </span>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {fmt(s.monto_solicitado)} — {s.tipo}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gris-500)' }}>
                    {s.plazo_meses} meses · {new Date(s.created_at).toLocaleDateString('es-PE')}
                  </div>
                  {s.puntaje_scoring && (
                    <div style={{ fontSize: 11, color: 'var(--gris-500)', marginTop: 4 }}>
                      Scoring: {s.puntaje_scoring}/100 · RDS: {s.rds}%
                    </div>
                  )}
                </div>
                {s.monto_aprobado && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--verde)' }}>Aprobado</div>
                    <div style={{ fontWeight: 700 }}>{fmt(s.monto_aprobado)}</div>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <span>📋</span>
              Sin solicitudes de crédito
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
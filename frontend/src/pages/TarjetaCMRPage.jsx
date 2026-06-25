import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function TarjetaCMRPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({ cuenta_id: '', linea_credito: 2000 });
  const [pagoForm, setPagoForm] = useState({ cuenta_origen_id: '', monto: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const cargar = () => {
    api.get('/tarjetas').then(d => setTarjetas(d.tarjetas)).catch(console.error);
    api.get('/cuentas').then(d => setCuentas(d.cuentas)).catch(console.error);
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (selected) {
      api.get(`/tarjetas/${selected.id}/movimientos`).then(d => setMovimientos(d.movimientos)).catch(console.error);
    }
  }, [selected]);

  const solicitar = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      await api.post('/tarjetas', { ...form, linea_credito: parseFloat(form.linea_credito) });
      setMsg({ type: 'ok', text: '¡Tarjeta CMR creada exitosamente!' });
      cargar();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const pagar = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const data = await api.post(`/tarjetas/${selected.id}/pagar`, {
        cuenta_origen_id: pagoForm.cuenta_origen_id,
        monto: parseFloat(pagoForm.monto),
      });
      setMsg({ type: 'ok', text: data.message });
      cargar();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Tarjeta CMR</h1>
      <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 28 }}>Gestiona tu línea de crédito</p>

      {/* Tarjetas actuales */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {tarjetas.map(t => (
          <div
            key={t.id}
            onClick={() => setSelected(t)}
            style={{
              width: 300, borderRadius: 18, padding: '24px',
              background: selected?.id === t.id
                ? 'linear-gradient(135deg, #00A550 0%, #003D1F 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: 'white', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>F</div>
              <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 999 }}>
                CMR
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 16, marginBottom: 20 }}>
              {t.numero_enmascarado}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>DISPONIBLE</div>
                <div style={{ fontWeight: 700 }}>{fmt(t.saldo_disponible)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>LÍNEA</div>
                <div style={{ fontWeight: 700 }}>{fmt(t.linea_credito)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Solicitar tarjeta */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 16 }}>Solicitar tarjeta CMR</h3>
          <form onSubmit={solicitar}>
            <div className="form-group">
              <label>Cuenta CMR asociada</label>
              <select value={form.cuenta_id} onChange={e => setForm(f => ({ ...f, cuenta_id: e.target.value }))} required>
                <option value="">Selecciona</option>
                {cuentas.filter(c => c.tipo === 'cmr').map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cuenta?.slice(-6)} — {c.tipo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Línea de crédito solicitada (S/)</label>
              <input type="number" min="500" max="20000" value={form.linea_credito}
                onChange={e => setForm(f => ({ ...f, linea_credito: e.target.value }))} required />
            </div>
            {msg.text && (
              <div style={{
                background: msg.type === 'ok' ? 'var(--verde-claro)' : '#FEE2E2',
                color: msg.type === 'ok' ? 'var(--verde-oscuro)' : '#991B1B',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12,
              }}>{msg.text}</div>
            )}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Solicitar tarjeta'}
            </button>
          </form>
        </div>

        {/* Pagar tarjeta */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>Pagar tarjeta</h3>
          <p style={{ color: 'var(--gris-500)', fontSize: 13, marginBottom: 16 }}>
            {selected ? `Tarjeta: ${selected.numero_enmascarado}` : 'Selecciona una tarjeta arriba'}
          </p>
          <form onSubmit={pagar}>
            <div className="form-group">
              <label>Cuenta de débito</label>
              <select value={pagoForm.cuenta_origen_id}
                onChange={e => setPagoForm(f => ({ ...f, cuenta_origen_id: e.target.value }))} required>
                <option value="">Selecciona cuenta</option>
                {cuentas.filter(c => c.tipo !== 'cmr').map(c => (
                  <option key={c.id} value={c.id}>{c.tipo} — {fmt(c.saldo_disponible)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Monto a pagar (S/)</label>
              <input type="number" min="0.01" step="0.01" placeholder="0.00"
                value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading || !selected}>
              {loading ? 'Procesando...' : 'Realizar pago'}
            </button>
          </form>
        </div>
      </div>

      {/* Movimientos de tarjeta seleccionada */}
      {selected && (
        <div className="card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gris-100)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>
              Movimientos — {selected.numero_enmascarado}
            </h3>
          </div>
          {movimientos.length ? movimientos.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', padding: '12px 24px', alignItems: 'center',
              borderBottom: i < movimientos.length - 1 ? '1px solid var(--gris-100)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.descripcion || m.tipo}</div>
                <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>
                  {new Date(m.created_at).toLocaleDateString('es-PE')}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: m.tipo === 'pago_tarjeta' ? 'var(--verde)' : 'var(--rojo)' }}>
                {fmt(m.monto)}
              </div>
            </div>
          )) : (
            <div className="empty-state"><span>🧾</span>Sin movimientos</div>
          )}
        </div>
      )}
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function TransferenciasPage() {
  const [cuentas, setCuentas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [form, setForm] = useState({ cuenta_origen_id: '', numero_cuenta_destino: '', monto: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cuentas').then(d => setCuentas(d.cuentas)).catch(console.error);
    api.get('/transferencias/historial').then(d => setHistorial(d.transferencias)).catch(console.error);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const data = await api.post('/transferencias', {
        ...form, monto: parseFloat(form.monto),
      });
      setSuccess(`✅ Transferencia exitosa. Referencia: ${data.transaccion.referencia}`);
      setForm({ cuenta_origen_id: '', numero_cuenta_destino: '', monto: '', descripcion: '' });
      api.get('/transferencias/historial').then(d => setHistorial(d.transferencias)).catch(console.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Transferencias</h1>
      <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 28 }}>Envía dinero a cualquier cuenta</p>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
        {/* Formulario */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Nueva transferencia</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Cuenta origen</label>
              <select value={form.cuenta_origen_id} onChange={e => set('cuenta_origen_id', e.target.value)} required>
                <option value="">Selecciona una cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tipo.toUpperCase()} — {c.numero_cuenta?.slice(-6)} — {fmt(c.saldo_disponible)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>N° de cuenta destino</label>
              <input
                placeholder="Ej: 0012345678901"
                value={form.numero_cuenta_destino}
                onChange={e => set('numero_cuenta_destino', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Monto (S/)</label>
              <input
                type="number" min="0.01" step="0.01"
                placeholder="0.00"
                value={form.monto}
                onChange={e => set('monto', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <input
                placeholder="Ej: Pago de alquiler"
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
              />
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginBottom: 14 }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'var(--verde-claro)', borderRadius: 8, padding: '10px 14px', color: 'var(--verde-oscuro)', fontSize: 13, marginBottom: 14 }}>
                {success}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Transferir →'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gris-100)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Historial de transferencias</h3>
          </div>
          {historial.length ? historial.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', padding: '14px 24px', alignItems: 'center',
              borderBottom: i < historial.length - 1 ? '1px solid var(--gris-100)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--verde-claro)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 14,
              }}>↔️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {t.cuenta_origen} → {t.cuenta_destino}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gris-500)' }}>
                  {t.referencia} · {new Date(t.created_at).toLocaleDateString('es-PE')}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--rojo)' }}>{fmt(t.monto)}</div>
            </div>
          )) : (
            <div className="empty-state"><span>📭</span>Sin transferencias realizadas</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

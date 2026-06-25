import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';
import { authService } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const estadoBadge = (e) => ({
  pendiente: 'badge-amarillo',
  aprobado: 'badge-verde',
  desembolsado: 'badge-verde',
  rechazado: 'badge-rojo',
  en_mora: 'badge-rojo',
  pagado: 'badge-gris',
}[e] || 'badge-gris');

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ cuenta_id: '', tipo: 'personal', monto_solicitado: '', plazo_meses: 12 });
  const [simulacion, setSimulacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [cargandoPrestamos, setCargandoPrestamos] = useState(true);

  const usuario = authService.getUsuario();
  const isAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    setCargandoPrestamos(true);
    try {
      const data = await api.get('/prestamos');
      console.log('📋 Préstamos recibidos:', data.prestamos);
      setPrestamos(data.prestamos || []);
    } catch (err) {
      console.error('❌ Error al cargar préstamos:', err);
    } finally {
      setCargandoPrestamos(false);
    }

    if (!isAdmin) {
      try {
        const cuentasData = await api.get('/cuentas');
        setCuentas(cuentasData.cuentas || []);
      } catch (err) {
        console.error('❌ Error al cargar cuentas:', err);
      }
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (selected) {
      api.get(`/prestamos/${selected.id}/cuotas`)
        .then(d => setCuotas(d.cuotas || []))
        .catch(console.error);
    }
  }, [selected]);

  // Simular cuota
  useEffect(() => {
    if (form.monto_solicitado && form.plazo_meses) {
      const tasas = { personal: 18, consumo: 24, vehicular: 12, hipotecario: 9 };
      const tasa = tasas[form.tipo] || 18;
      const i = tasa / 100 / 12;
      const n = parseInt(form.plazo_meses);
      const monto = parseFloat(form.monto_solicitado);
      if (monto > 0 && n > 0) {
        const cuota = (monto * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        setSimulacion({ cuota: cuota.toFixed(2), tasa, total: (cuota * n).toFixed(2) });
      }
    }
  }, [form.monto_solicitado, form.plazo_meses, form.tipo]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // CLIENTE: Solicitar préstamo
  const solicitar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await api.post('/prestamos/solicitar', {
        ...form,
        monto_solicitado: parseFloat(form.monto_solicitado),
        plazo_meses: parseInt(form.plazo_meses),
      });
      setMsg({ type: 'ok', text: data.message });
      await cargar();
      setForm({ cuenta_id: '', tipo: 'personal', monto_solicitado: '', plazo_meses: 12 });
      setSimulacion(null);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Aprobar préstamo
  const aprobarPrestamo = async (prestamoId) => {
    if (!confirm('¿Aprobar este préstamo?')) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await api.post(`/prestamos/${prestamoId}/aprobar`, {});
      setMsg({ type: 'ok', text: data.message });
      await cargar();
      setSelected(null);
      setCuotas([]);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Rechazar préstamo
  const rechazarPrestamo = async (prestamoId) => {
    if (!confirm('¿Rechazar este préstamo?')) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await api.post(`/prestamos/${prestamoId}/aprobar`, {});
      setMsg({ type: 'ok', text: data.message });
      await cargar();
      setSelected(null);
      setCuotas([]);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const prestamosPendientes = prestamos.filter(p => p.estado === 'pendiente');
  const prestamosHistorial = prestamos.filter(p => p.estado !== 'pendiente');

  // Debug: Mostrar en consola cuántos préstamos hay
  console.log(`📊 Total préstamos: ${prestamos.length}, Pendientes: ${prestamosPendientes.length}`);

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Préstamos</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
        {isAdmin ? 'Gestiona las solicitudes de préstamo de los clientes' : 'Solicita financiamiento rápido y seguro'}
      </p>

      {/* ADMIN: Panel de aprobación */}
      {isAdmin && (
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ 
              padding: '14px 20px', 
              borderBottom: '1px solid #F3F4F6',
              background: '#F9FAFB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
                ⏳ Solicitudes pendientes
                <span className="badge badge-amarillo" style={{ marginLeft: 10 }}>
                  {prestamosPendientes.length}
                </span>
              </h3>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                {cargandoPrestamos ? 'Cargando...' : `Total: ${prestamos.length}`}
              </span>
            </div>

            {cargandoPrestamos ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="loader" style={{ width: 30, height: 30 }} />
                <p style={{ marginTop: 10 }}>Cargando solicitudes...</p>
              </div>
            ) : prestamosPendientes.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <span>✅</span>
                <h4>No hay solicitudes pendientes</h4>
                <p>Espera a que los clientes soliciten préstamos.</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                  {prestamos.length > 0 ? `Hay ${prestamos.length} préstamos en otros estados` : 'No hay ningún préstamo en el sistema'}
                </p>
              </div>
            ) : (
              <div>
                {prestamosPendientes.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setSelected(p)}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderBottom: i < prestamosPendientes.length - 1 ? '1px solid #F3F4F6' : 'none',
                      background: selected?.id === p.id ? '#E8F7EF' : 'white',
                      transition: 'background 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={e => {
                      if (selected?.id !== p.id) {
                        e.currentTarget.style.background = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selected?.id !== p.id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        Cliente: <span style={{ color: '#111827' }}>{p.cliente || p.usuario_id || 'N/A'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {fmt(p.monto_solicitado)} · {p.tipo} · {p.plazo_meses} meses
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-amarillo">pendiente</span>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        Cuota: {fmt(p.cuota_mensual)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalle del préstamo seleccionado (para admin) */}
          {selected && selected.estado === 'pendiente' && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#111827' }}>
                📋 Detalle de la solicitud
              </h3>
              <div style={{
                background: '#F9FAFB',
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 16,
                border: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 13 }}>
                  <div><strong>Cliente:</strong> {selected.cliente || selected.usuario_id || 'N/A'}</div>
                  <div><strong>Monto:</strong> {fmt(selected.monto_solicitado)}</div>
                  <div><strong>Tipo:</strong> {selected.tipo}</div>
                  <div><strong>Plazo:</strong> {selected.plazo_meses} meses</div>
                  <div><strong>Cuota mensual:</strong> {fmt(selected.cuota_mensual)}</div>
                  <div><strong>Estado:</strong> <span className="badge badge-amarillo">pendiente</span></div>
                </div>
              </div>

              {msg.text && (
                <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                  {msg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-success"
                  onClick={() => aprobarPrestamo(selected.id)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Procesando...' : '✅ Aprobar préstamo'}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => rechazarPrestamo(selected.id)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Procesando...' : '❌ Rechazar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLIENTE: Formulario de solicitud */}
      {!isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>
          {/* Formulario */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 16 }}>Solicitar préstamo</h3>
            <form onSubmit={solicitar}>
              <div className="form-group">
                <label>Cuenta de desembolso</label>
                <select value={form.cuenta_id} onChange={e => set('cuenta_id', e.target.value)} required>
                  <option value="">Selecciona cuenta</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.tipo} — {c.numero_cuenta?.slice(-6)} — {fmt(c.saldo_disponible)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de préstamo</label>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  <option value="personal">Personal — 18% anual</option>
                  <option value="consumo">Consumo — 24% anual</option>
                  <option value="vehicular">Vehicular — 12% anual</option>
                  <option value="hipotecario">Hipotecario — 9% anual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto (S/)</label>
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

              {simulacion && (
                <div style={{
                  background: '#E8F7EF',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 16
                }}>
                  <div style={{ fontWeight: 700, color: '#007A3A', marginBottom: 6, fontSize: 13 }}>
                    📊 Simulación de cuota
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <div>Cuota mensual: <strong>{fmt(simulacion.cuota)}</strong></div>
                    <div>Total: <strong>{fmt(simulacion.total)}</strong></div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                    Tasa: {simulacion.tasa}% anual
                  </div>
                </div>
              )}

              {msg.text && (
                <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'} style={{ marginBottom: 12 }}>
                  {msg.text}
                </div>
              )}
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Enviando solicitud...' : 'Solicitar préstamo'}
              </button>
            </form>
          </div>

          {/* Historial de préstamos del cliente */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 15 }}>Mis préstamos</h3>
              </div>
              {prestamos.length ? prestamos.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{
                    padding: '16px 24px',
                    cursor: 'pointer',
                    borderBottom: i < prestamos.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: selected?.id === p.id ? '#E8F7EF' : 'white',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`badge ${estadoBadge(p.estado)}`} style={{ marginBottom: 6 }}>
                        {p.estado}
                      </span>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)} — {fmt(p.monto_aprobado || p.monto_solicitado)}
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
                <div className="empty-state"><span>🏦</span>Sin préstamos</div>
              )}
            </div>

            {/* Cuotas del préstamo seleccionado */}
            {selected && cuotas.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14 }}>Tabla de cuotas</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['N°', 'Vence', 'Capital', 'Interés', 'Cuota', 'Estado'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cuotas.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 16px' }}>{c.numero_cuota}</td>
                          <td style={{ padding: '10px 16px' }}>{new Date(c.fecha_vencimiento).toLocaleDateString('es-PE')}</td>
                          <td style={{ padding: '10px 16px' }}>{fmt(c.monto_capital)}</td>
                          <td style={{ padding: '10px 16px' }}>{fmt(c.monto_interes)}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 700 }}>{fmt(c.monto_cuota)}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <span className={`badge ${estadoBadge(c.estado)}`}>{c.estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN: Historial de préstamos */}
      {isAdmin && prestamosHistorial.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
            <h3 style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>📜 Historial de préstamos</h3>
          </div>
          {prestamosHistorial.map((p, i) => (
            <div
              key={p.id}
              style={{
                padding: '12px 20px',
                borderBottom: i < prestamosHistorial.length - 1 ? '1px solid #F3F4F6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  {p.cliente || p.usuario_id || 'N/A'} — {fmt(p.monto_aprobado || p.monto_solicitado)}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {p.tipo} · {p.plazo_meses} meses
                </div>
              </div>
              <span className={`badge ${estadoBadge(p.estado)}`}>{p.estado}</span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
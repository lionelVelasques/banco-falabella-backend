import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/authService';

const fmt = (n) => `S/ ${parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function AdminPrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [montoAprobado, setMontoAprobado] = useState('');

  const cargar = async () => {
    try {
      const data = await api.get('/prestamos');
      setPrestamos(data.prestamos || []);
    } catch (err) {
      console.error('❌ Error al cargar préstamos:', err);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (selected) {
      setMontoAprobado(selected.monto_solicitado || selected.monto_aprobado || '');
    }
  }, [selected]);

  const aprobarPrestamo = async (prestamoId) => {
    if (!confirm('¿Aprobar este préstamo?')) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await api.post(`/prestamos/${prestamoId}/aprobar`, {
        monto_aprobado: parseFloat(montoAprobado) || undefined
      });
      setMsg({ type: 'ok', text: data.message });
      await cargar();
      setSelected(null);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const rechazarPrestamo = async (prestamoId) => {
    if (!confirm('¿Rechazar este préstamo?')) return;
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await api.post(`/prestamos/${prestamoId}/aprobar`, {
        accion: 'rechazar'
      });
      setMsg({ type: 'ok', text: data.message });
      await cargar();
      setSelected(null);
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const prestamosPendientes = prestamos.filter(p => p.estado === 'pendiente');

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          📋 Validar Préstamos
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15 }}>
          Aprueba o rechaza las solicitudes de préstamo de los clientes
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>
            {prestamosPendientes.length}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Pendientes de aprobación</div>
        </div>
        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#00A550' }}>
            {prestamos.filter(p => p.estado === 'desembolsado').length}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Préstamos activos</div>
        </div>
        <div className="kpi-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#E31837' }}>
            {prestamos.filter(p => p.estado === 'en_mora').length}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>En mora</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Lista de préstamos pendientes */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ 
            padding: '16px 20px', 
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
          </div>

          {prestamosPendientes.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <span>✅</span>
              <h4>No hay solicitudes pendientes</h4>
              <p>Espera a que los clientes soliciten préstamos.</p>
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
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {p.cliente || `Usuario #${p.usuario_id}`}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle y aprobación */}
        <div>
          {selected ? (
            <div className="card">
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
                  <div><strong>Email:</strong> {selected.cliente_email || 'N/A'}</div>
                  <div><strong>Monto:</strong> {fmt(selected.monto_solicitado)}</div>
                  <div><strong>Tipo:</strong> {selected.tipo}</div>
                  <div><strong>Plazo:</strong> {selected.plazo_meses} meses</div>
                  <div><strong>Cuota mensual:</strong> {fmt(selected.cuota_mensual)}</div>
                  <div><strong>Tasa:</strong> {selected.tasa_interes}%</div>
                  <div><strong>Estado:</strong> <span className="badge badge-amarillo">pendiente</span></div>
                </div>
              </div>

              <div className="form-group">
                <label>Monto a aprobar (S/)</label>
                <input
                  type="number"
                  value={montoAprobado}
                  onChange={(e) => setMontoAprobado(e.target.value)}
                  placeholder="Dejar en blanco para usar el monto solicitado"
                />
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
          ) : (
            <div className="card" style={{ textAlign: 'center', color: '#6B7280', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <h4 style={{ color: '#374151' }}>Selecciona una solicitud</h4>
              <p style={{ fontSize: 14 }}>Selecciona un préstamo pendiente para evaluar</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}